import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';

interface MessagePayload {
  event: string;
  text: string;
  memberData: Member | null;
}

interface InfoPayload {
  event: string;
  totalClients: number;
  memeberData: Member | null;
  action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketEventsGateway');
  private summaryClient: number = 0;

  // --- Map tipini Member | null qilib kengaytirdik
  private clientsAuthMap = new Map<WebSocket, Member | null>();
  private messageList: MessagePayload[] = [];

  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  public afterInit(server: Server) {
    this.logger.verbose(`WebSocket Server Initialized & total [ ${this.summaryClient}]`);
  }

  private async retrieveAuth(req: any): Promise<Member | null> {
    try {
      const parseUrl = url.parse(req.url, true);
      const { token } = parseUrl.query;
      if (!token) return null;
      return await this.authService.verifyToken(token as string);
    } catch (err) {
      return null;
    }
  }

  public async handleConnection(client: WebSocket, req: any) {
    const authMember = await this.retrieveAuth(req);
    this.summaryClient++;
    console.log('authMember', authMember);
    this.clientsAuthMap.set(client, authMember);

    const clientNick: string = authMember?.memberNick ?? 'Guest';
    this.logger.verbose(` Connnection [${clientNick}] & total:[ ${this.summaryClient}]`);

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.summaryClient,
      memeberData: authMember,
      action: 'joined',
    };

    this.emitMessage(infoMsg);

    client.send(JSON.stringify({ event: 'getMessages', list: this.messageList }));
  }

  public handleDisconnect(client: WebSocket) {
    const authMember = this.clientsAuthMap.get(client) ?? null;
    this.summaryClient--;
    this.clientsAuthMap.delete(client);

    const clientNick: string = authMember?.memberNick ?? 'Guest';
    this.logger.verbose(`Disconnection [${clientNick}] & total:[ ${this.summaryClient}]`);

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.summaryClient,
      memeberData: authMember,
      action: 'left',
    };

    this.broadcastMessage(client, infoMsg);
  }

  @SubscribeMessage('message')
  public async handleMessage(client: WebSocket, payload: string): Promise<void> {
    const authMember = this.clientsAuthMap.get(client) ?? null;
    const newMessage: MessagePayload = { event: 'message', text: payload, memberData: authMember };

    const clientNick: string = authMember?.memberNick ?? 'Guest';
    this.logger.verbose(`NEW MESSAGE [${clientNick}]: ${payload}`);

    this.messageList.push(newMessage);
    if (this.messageList.length > 5) this.messageList.splice(0, this.messageList.length - 5);

    this.emitMessage(newMessage);
  }

  private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private emitMessage(message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}


// @WebSocketGateway({ transports: ['websocket'], secure: false })
// // @WebSocketGateway(...) — bu decorator bo‘lib, klassni WebSocket gateway deb belgilaydi.
// // transports websocket deb belgilangan, ya’ni polling o‘chirib qo‘yganmiz.
// export class SocketGateway implements OnGatewayInit {
// 	// socketGateway – klass bu kevotti bu OnGatewayInit interfaceni implement qilyapti
// 	private logger: Logger = new Logger('SocketEventsGateway');
// 	// logger — bu property (Logger tipida), log yozish uchun ishlatiladi.
// 	// Logger('SocketEventsGateway') — bu yerda SocketEventsGateway — log tag sifatida ko‘rsatiladi
// 	private summaryClient: number = 0;
// 	// summaryClient — bu ham property bo‘lib, foydalanuvchilar sonini hisoblash uchun ishlatiladi.
// 	// summaryClient ni logda chiqarilyapti — bu oddiygina boshlang‘ich qiymatni ko‘rsatish

// 	public afterInit(server: Server) {
// 		// afterInit() method kelib ichida serverni  argument qilib berdik
// 		this.logger.log(`WebSocket Server Initialized total: ${this.summaryClient}`);
// 		// this.logger.log(...) — bu yerda property (logger) orqali method (log) chaqirilgan.
// 	}

// 	handleConnection(client: WebSocket, ...args: any[]) {
// 		// handleConnection() — bu method. ichida 2 ta  client, args — bu yerda argumentlar berdik
// 		this.summaryClient++; // this.summaryClient++ — bu property qiymatini oshiradi
// 		this.logger.log(`== Client connected total: ${this.summaryClient} ==`);
// 		// logger.log(...) — method orqali log yoziladi.

// 		//Har safar WebSocket orqali yangi foydalanuvchi ulanadigan bo‘lsa:
// 		//Uni hisobga oladi
// 		//Foydalanuvchilar sonini oshiradi
// 		//Logga yozadi
// 	}

// 	handleDisconnect(client: WebSocket) {
// 		this.summaryClient--;
// 		this.logger.log(`== Client disconnected left total: ${this.summaryClient} ==`);
// 	}

// 	@SubscribeMessage('message')
// 	public handleMessage(client: WebSocket, payload: any): string {
// 		return 'Hello world!';
// 	}
// }
