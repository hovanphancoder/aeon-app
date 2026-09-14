import { config } from '../config';

export interface IZNSService {
  sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class MockZNSProvider implements IZNSService {
  async sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const timestamp = new Date().toISOString();
    console.log('\n========================================');
    console.log(`[MOCK ZNS OTP] [${timestamp}]`);
    console.log(`📱 Gửi mã OTP tới số điện thoại: ${phone}`);
    console.log(`🔑 Mã OTP xác nhận: [ ${otp} ]`);
    console.log(`⏳ Thời hạn: ${config.zns.otpTtlMinutes} phút`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: `mock-msg-${Date.now()}`,
    };
  }
}

export class ZaloZNSProvider implements IZNSService {
  private appId: string;
  private templateId: string;
  private accessToken: string;

  constructor() {
    this.appId = config.zns.appId;
    this.templateId = config.zns.templateId;
    this.accessToken = config.zns.accessToken;
  }

  async sendOTP(phone: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Chuẩn hóa số điện thoại dạng 84...
      let formattedPhone = phone.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '84' + formattedPhone.slice(1);
      }

      console.log(`[ZaloZNSProvider] Gửi OTP tới ${formattedPhone} qua ZNS Template ${this.templateId}`);

      // Gọi endpoint Zalo Business API
      const response = await fetch('https://business.openapi.zalo.me/message/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.accessToken,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          template_id: this.templateId,
          template_data: {
            otp: otp,
            time: `${config.zns.otpTtlMinutes} phút`,
          },
          tracking_id: `tracking-${Date.now()}`
        })
      });

      const result = (await response.json()) as any;

      if (result.error !== 0) {
        console.error('[ZaloZNSProvider] Gửi tin nhắn thất bại:', result);
        return {
          success: false,
          error: result.message || 'Lỗi gửi Zalo ZNS',
        };
      }

      return {
        success: true,
        messageId: result.data?.msg_id,
      };
    } catch (err: any) {
      console.error('[ZaloZNSProvider] Ngoại lệ kết nối API Zalo:', err);
      return {
        success: false,
        error: err.message || 'Lỗi mạng khi kết nối Zalo ZNS',
      };
    }
  }
}

// Factory Provider
export function getZNSService(): IZNSService {
  if (config.zns.provider === 'zalo') {
    return new ZaloZNSProvider();
  }
  return new MockZNSProvider();
}

export const znsService = getZNSService();
