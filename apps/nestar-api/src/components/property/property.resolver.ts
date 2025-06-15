import { PropertyService } from './property.service';
import { Resolver } from '@nestjs/graphql';

@Resolver()
export class PropertyResolver {
    constructor(private readonly propertyService: PropertyService){}
}
