import { RequirementsService } from './requirements.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RequirementsService', () => {
  let service: RequirementsService;
  let prisma: {
    requirement: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      requirement: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new RequirementsService(prisma as unknown as PrismaService);
  });

  it('persists select form fields as a JSON string array for form requirements', async () => {
    prisma.requirement.findUnique.mockResolvedValue(null);
    prisma.requirement.create.mockResolvedValue({ requirement_code: 'PP000001REQ' });

    await service.create(
      {
        code: 'PP000001REQ',
        name: 'Personal Photo',
        type: 'form',
        form_input_kind: 'select',
        form_options: ['Sole Proprietorship', 'Partnership'],
      },
      'ADMIN-001',
    );

    expect(prisma.requirement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        requirement_code: 'PP000001REQ',
        requirement_name: 'Personal Photo',
        requirement_type: 'form',
        form_input_kind: 'select',
        form_options: ['Sole Proprietorship', 'Partnership'],
      }),
    });
  });

  it('stores form fields as null for non-form requirements', async () => {
    prisma.requirement.findUnique.mockResolvedValue(null);
    prisma.requirement.create.mockResolvedValue({ requirement_code: 'PP000002REQ' });

    await service.create(
      {
        code: 'PP000002REQ',
        name: 'Personal Photo',
        type: 'image',
        form_input_kind: 'select',
        form_options: ['Sole Proprietorship'],
      },
      'ADMIN-001',
    );

    expect(prisma.requirement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        requirement_code: 'PP000002REQ',
        requirement_name: 'Personal Photo',
        requirement_type: 'image',
        form_input_kind: null,
        form_options: null,
      }),
    });
  });
});
