export declare class CreateRequirementDto {
    code: string;
    name: string;
    type: string;
    form_input_kind?: string | null;
    form_options?: string[] | null;
}
export declare class UpdateRequirementDto {
    name?: string;
    type?: string;
}
