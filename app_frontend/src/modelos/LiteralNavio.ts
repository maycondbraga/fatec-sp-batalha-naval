import { LtNavio } from "./LtNavio"

export class LiteralNavio {
    static PortaAviao: LtNavio = { tamnQuadrados: 4, nome: '4 Slots', }; // tamnQuadrados "funciona" como o id do navio
    static NavioTanque: LtNavio = { tamnQuadrados: 3, nome: '3 Slots' };
    static Contratorpedeiro: LtNavio = { tamnQuadrados: 2, nome: '2 Slots' };
    static Submarino: LtNavio = { tamnQuadrados: 1, nome: '1 Slot' };

    static listar = (): LtNavio[] => [ this.PortaAviao, this.NavioTanque, this.Contratorpedeiro, this.Submarino ];

    static obterPorTamnQuadradosOrDefault = (tamnQuadrados: number): LtNavio | null => {
        const navio = this.listar().find(x => x.tamnQuadrados == tamnQuadrados);
        return (navio == undefined) ? null : navio;
    }
}