import { DbEncVn } from "./comum/DbEncVn";

export class DbTema extends DbEncVn {
    constructor() {
        super();
        this.nome = '';
        this.preco = 0;
        this.descricao = '';
        this.fundoTela = '';
    }
    nome: string
    preco: number 
    descricao: string
    fundoTela: string
}