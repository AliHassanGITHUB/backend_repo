export declare class DocumentRequirementItemDto {
    code: string;
    isMandatory: boolean;
}
export declare class CreateDocumentDto {
    code: string;
    name: string;
    description: string;
    fees: number;
    processingDays: number;
    categoryId: number;
    requirements?: DocumentRequirementItemDto[];
}
export declare class UpdateDocumentDto {
    name?: string;
    description?: string;
    fees?: number;
    processingDays?: number;
    categoryId?: number;
    requirements?: DocumentRequirementItemDto[];
}
