import { Logger } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import * as url from 'url';
import { Member } from '../libs/dto/member/member';

interface MessagePayload {
	event: string;
	text: string;
	memberData?: Member;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventGateway');
	private summaryClient: number = 0;
	private clientAuthMap = new Map<WebSocket, Member>();
	private messageList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;
	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized & total: ${this.summaryClient}`);
	}

	private async retrieveAuth(req: any): Promise<Member> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			console.log('token:', token);
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		this.summaryClient++;

		console.log('authMember', authMember);
		this.clientAuthMap.set(client, authMember);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] :total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};
		this.emitMessage(infoMsg); //3 websocket ga ulangan client larga habar jonatadi

		client.send(JSON.stringify({ event: 'getMessages', list: this.messageList }));
	} //ulangan client ga habar yuborish

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientAuthMap.get(client);

		this.summaryClient--;
		this.clientAuthMap.delete(client);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.log(`Disconnected [${clientNick}]& total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};
		this.broadcastMessage(client, infoMsg); //usizlgan client dan  tashqari hamma client ga jonatadi
	}
	@SubscribeMessage('message')
	public async handleMessage(@ConnectedSocket() client: WebSocket, @MessageBody() payload: string): Promise<void> {
		const authMember = this.clientAuthMap.get(client);
		const newMessage: MessagePayload = { event: 'message', text: payload, memberData: authMember };
		const clientNick: string = authMember?.memberNick ?? 'Guest';

		this.logger.verbose(`NEW MESSAGE[${clientNick}]: ${payload}`);
		this.messageList.push(newMessage);
		if (this.messageList.length > 5) {
			this.messageList.splice(0, this.messageList.length - 5);
		}

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
