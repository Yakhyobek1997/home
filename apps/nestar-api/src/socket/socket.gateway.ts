import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ transports: ['websocket'], secure: false })
// @WebSocketGateway(...) — bu decorator bo‘lib, klassni WebSocket gateway deb belgilaydi.
// transports websocket deb belgilangan, ya’ni polling o‘chirib qo‘yganmiz.
export class SocketGateway implements OnGatewayInit {
	// socketGateway – klass bu kevotti bu OnGatewayInit interfaceni implement qilyapti
	private logger: Logger = new Logger('SocketEventsGateway');
	// logger — bu property (Logger tipida), log yozish uchun ishlatiladi.
	// Logger('SocketEventsGateway') — bu yerda SocketEventsGateway — log tag sifatida ko‘rsatiladi
	private summaryClient: number = 0;
	// summaryClient — bu ham property bo‘lib, foydalanuvchilar sonini hisoblash uchun ishlatiladi.
	// summaryClient ni logda chiqarilyapti — bu oddiygina boshlang‘ich qiymatni ko‘rsatish

	public afterInit(server: Server) {
		// afterInit() method kelib ichida serverni  argument qilib berdik
		this.logger.log(`WebSocket Server Initialized total: ${this.summaryClient}`);
		// this.logger.log(...) — bu yerda property (logger) orqali method (log) chaqirilgan.
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		// handleConnection() — bu method. ichida 2 ta  client, args — bu yerda argumentlar berdik
		this.summaryClient++; // this.summaryClient++ — bu property qiymatini oshiradi
		this.logger.log(`== Client connected total: ${this.summaryClient} ==`);
		// logger.log(...) — method orqali log yoziladi.

		//Har safar WebSocket orqali yangi foydalanuvchi ulanadigan bo‘lsa:
		//Uni hisobga oladi
		//Foydalanuvchilar sonini oshiradi
		//Logga yozadi
	}

	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.log(`== Client disconnected left total: ${this.summaryClient} ==`);
	}

	@SubscribeMessage('message')
	public handleMessage(client: WebSocket, payload: any): string {
		return 'Hello world!';
	}
}
