import { ChatMessage } from './chat-message.entity';
export declare class ChatAttachment {
    id: string;
    messageId: string;
    message: ChatMessage;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
}
