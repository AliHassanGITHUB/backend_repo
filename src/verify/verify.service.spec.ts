import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VerifyService } from './verify.service';

describe('VerifyService', () => {
  let service: VerifyService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VerifyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'ENABLE_MOCK_OTP') return 'true';
              return defaultValue ?? '';
            }),
            getOrThrow: jest.fn(() => {
              throw new Error('not set');
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(VerifyService);
  });

  it('stores and validates a mock OTP for a phone number', async () => {
    const result = await service.start('+961 70 123 456');

    expect(result).toEqual(
      expect.objectContaining({
        mockOtp: expect.stringMatching(/^\d{6}$/),
      }),
    );

    const isValid = await service.check('+961 70 123 456', result.mockOtp);
    expect(isValid).toBe(true);
  });
});
