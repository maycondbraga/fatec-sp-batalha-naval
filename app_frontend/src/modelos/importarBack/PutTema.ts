import { PutNavioTema } from "./PutNavioTema";

export class PutTema {
    id: string = '';
    nome: string = '';
    preco: number | null = null;
    descricao: string = '';
    fundoTela: Blob | null = null;
    naviosTema: PutNavioTema[] = [];
}