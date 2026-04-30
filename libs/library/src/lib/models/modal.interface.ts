export interface IModal {
    size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto';
    title: string;

    get isShown(): boolean;

    closeModal(): void;
    toggleModal(): void;
}