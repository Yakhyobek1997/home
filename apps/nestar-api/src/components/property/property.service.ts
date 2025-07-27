import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { Direction, Message } from '../../libs/enums/common.enum';
import {
  AgentPropertiesInquiry,
  AllPropertiesInquiry,
  OrdinaryInquiry,
  PropertiesInquiry,
  PropertyInput,
} from '../../libs/dto/property/property.input';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewService } from '../view/view.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import * as moment from 'moment';
import {
  lookUpAuthMemberLiked,
  lookUpMember,
  shapeId,
} from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel('Property') private readonly propertyModel: Model<Property>,
    private memberService: MemberService,
    private viewService: ViewService,
    private likeService: LikeService,
  ) {}

  //createProperty
  public async createProperty(input: PropertyInput): Promise<Property> {
    console.log('executed: createProperty');
    try {
      const result = await this.propertyModel.create(input);
      // increase member properties
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProperties',
        modifier: 1,
      });
      return result;
    } catch (error) {
      console.log('createProperty service', error);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }
  //getProperty
  public async getProperty(
    memberId: ObjectId,
    propertyId: ObjectId,
  ): Promise<Property> {
    const search: T = {
      _id: propertyId,
      propertyStatus: PropertyStatus.ACTIVE,
    };
    const targetProperty = await this.propertyModel.findOne(search).exec();
    if (!targetProperty)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: propertyId,
        viewGroup: ViewGroup.PROPERTY,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.propertyStatsEditor({
          _id: propertyId,
          targetKey: 'propertyViews',
          modifier: 1,
        });
        targetProperty.propertyViews++;
        //me liked

        //liked?
        const input: LikeInput = {
          memberId: memberId,
          likeRefId: propertyId,
          likeGroup: LikeGroup.PROPERTY,
        };
        targetProperty.meLiked =
          await this.likeService.checkLikeExistence(input);
      }
    }
    targetProperty.memberData = await this.memberService.getMember(
      null,
      targetProperty.memberId,
    );
    return targetProperty;
  }

  //update Property
  public async updateProperty(
    memberId: ObjectId,
    input: PropertyUpdate,
  ): Promise<Property> {
    let { propertyStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,
      memberId: memberId,
      propertyStatus: PropertyStatus.ACTIVE,
    };

    if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
    if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.propertyModel.findOneAndUpdate(search, input, {
      new: true,
    });
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberProperties',
        modifier: -1,
      });
    }

    return result;
  }
  //////////get All properties method
  public async getProperties(
    memberId: ObjectId,
    input: PropertiesInquiry,
  ): Promise<Properties> {
    const match: T = { propertyStatus: PropertyStatus.ACTIVE };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };
    this.shapeMatchQuery(match, input);
    console.log('match', match);

    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        {
          $sort: sort,
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpAuthMemberLiked(memberId),
              lookUpMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  //getFavorites
  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Properties> {
    return await this.likeService.getFavoriteProperties(memberId, input);
  }

  //getFavorites
  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Properties> {
    return await this.viewService.getVisitedProperties(memberId, input);
  }

  public async getAgentProperties(
    memberId: ObjectId,
    input: AgentPropertiesInquiry,
  ): Promise<Properties> {
    const { propertyStatus } = input.search;
    if (propertyStatus === PropertyStatus.DELETE)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

    const match: T = {
      memberId: memberId,
      propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        {
          $sort: sort,
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }
  ////////like
  public async likeTargetProperty(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<Property> {
    const target = await this.propertyModel
      .findOne({
        _id: targetId,
        propertyStatus: PropertyStatus.ACTIVE,
      })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: targetId,
      likeGroup: LikeGroup.PROPERTY,
    };

    const modifier: number = await this.likeService.makeToggle(input);
    const result = await this.propertyStatsEditor({
      _id: targetId,
      targetKey: 'propertyLikes',
      modifier: modifier,
    });
    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  /////////////// admin methods
  public async getAllPropertiesByAdmin(
    input: AllPropertiesInquiry,
  ): Promise<Properties> {
    const { propertyStatus, propertyLocationList } = input.search;

    const match: T = {};
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    if (propertyStatus) match.propertyStatus = propertyStatus;
    if (propertyLocationList)
      match.propertyLocation = { $in: propertyLocationList };

    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        {
          $sort: sort,
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  //admin property update
  public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
    let { propertyStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,
      propertyStatus: PropertyStatus.ACTIVE,
    };

    if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
    if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.propertyModel.findOneAndUpdate(search, input, {
      new: true,
    });
    console.log(result);
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProperties',
        modifier: -1,
      });
    }

    return result;
  }

  public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
    const search: T = {
      _id: propertyId,
      propertyStatus: PropertyStatus.DELETE,
    };

    const result = await this.propertyModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }

  /////////////// private methods
  private shapeMatchQuery(
    match: Record<string, any>,
    input: PropertiesInquiry,
  ): void {
    const {
      memberId,
      locationList,
      roomsList,
      bedsList,
      typeList,
      periodsRange,
      pricesRange,
      squaresRange,
      options,
      text,
    } = input.search;

    if (memberId) match.memberId = shapeId(memberId);
    if (locationList && locationList.length)
      match.propertyLocation = { $in: locationList };
    if (roomsList && roomsList.length) match.propertyRooms = { $in: roomsList };
    if (bedsList && bedsList.length) match.propertyBeds = { $in: bedsList };
    if (typeList && typeList.length) match.propertyType = { $in: typeList };

    if (pricesRange)
      match.propertyPrice = {
        $gte: pricesRange.start,
        $lte: pricesRange.end,
      };

    if (periodsRange)
      match.createdAt = {
        $gte: periodsRange.start,
        $lte: periodsRange.end,
      };

    if (squaresRange)
      match.propertySquare = {
        $gte: squaresRange.start,
        $lte: squaresRange.end,
      };

    if (text)
      match.propertyTitle = {
        $regex: new RegExp(text, 'i'),
      };

    if (options) {
      match['$or'] = options.map((ele) => {
        return { [ele]: true };
      });
    }
  }

  public async propertyStatsEditor(
    input: StatisticModifier,
  ): Promise<Property | null> {
    const { _id, targetKey, modifier } = input;
    return await this.propertyModel
      .findOneAndUpdate(
        _id,
        {
          $inc: { [targetKey]: modifier },
        },
        { new: true },
      )
      .exec();
  }
}
