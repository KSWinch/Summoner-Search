export type ExampleType = {
    id: number;
    name: string;
    description?: string;
};

export interface ExampleInterface {
    title: string;
    items: ExampleType[];
}