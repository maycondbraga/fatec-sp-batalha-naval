import { Button, Card, CardActions, CardContent, Fab, Pagination, styled, TextField, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PosicaoContainerPrevia from '../../components/PosicaoContainerPrevia';
import ConfirmacaoModal from '../../components/confirmacaoModal/ConfirmacaoModal';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ImgNavioVertical from '../../components/imagem/ImgNavioVertical';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdResumoTema } from '../../modelos/importarBack/MdResumoTema';
import { PutEquiparTema } from '../../modelos/importarBack/PutEquiparTema';
import { UtilPagina } from '../../util/UtilPagina';
import AddIcon from '@mui/icons-material/Add';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const WhitePagination = styled(Pagination)({
    color: 'white',
    backgroundColor: 'white',
    borderRadius: '10px'
})

const IndexMochila = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [lTemas, setLTemas] = useState<MdResumoTema[]>([]);
    const [pagina, setPagina] = useState(1);
    const [idTemaEquipado, setIdTemaEquipado] = useState('');
    const [carregouTemas, setCarregouTemas] = useState(false);
    const [carregouEquipacao, setCarregouEquipacao] = useState(true);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    useEffect(() => {
        let divRoot = document.getElementById("root");
        divRoot!.style.backgroundRepeat = "no-repeat";
        divRoot!.style.backgroundSize = "cover";
        divRoot!.style.backgroundImage = "url('../assets/fundo-padrao-battle-of-ocean.png')";
    }, [])

    useEffect(() => {
        clientRest.callGetAutorizado<MdResumoTema[]>('/api/compra/listarPorIdUsuarioLogado', [])
            .then(async (rLista) => {
                if (rLista.eOk) {
                    const rIdTemaEquipado = await clientRest.callGetAutorizado<string>('/api/compra/obterIdTemaEquipadoUsuarioLogadoOrDefault', '');
                    if (rIdTemaEquipado.eOk) {
                        setIdTemaEquipado(_ => rIdTemaEquipado.body ?? '');
                        setLTemas(_ => rLista.body ?? []);
                        setCarregouTemas(_ => true);
                    } else {
                        setProblemaErro(_ => rIdTemaEquipado.problema);
                        setErroEstaAberto(_ => true);
                    }
                } else {
                    setProblemaErro(_ => rLista.problema);
                    setErroEstaAberto(_ => true);
                }
            });
        
        return () => {
            setCarregouTemas(_ => true);
            setCarregouEquipacao(_ => true);
        }
    }, []);

    let qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 2);
    let temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 2);
    
    const handleClickEquipar = async (idTema: string) => {
        const putEquiparTema = new PutEquiparTema();
        putEquiparTema.idTema = idTema;
        setCarregouEquipacao(_ => false);
        const rEquipacao = await clientRest.callPutAutorizado<undefined>('/api/compra/equiparTemaUsuarioLogado', putEquiparTema, undefined);
        if (rEquipacao.eOk) {
            setIdTemaEquipado(_ => idTema);
            setCarregouEquipacao(_ => true);
        } else {
            setProblemaErro(rEquipacao.problema);
            setErroEstaAberto(_ => true);
            setCarregouEquipacao(_ => true);
        }
    }
    
    return (
        <div>
            <h1 style={{color: 'black', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>Inventário de temas</h1>
            <h5 style={{color: 'black', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>Equipe os temas comprados na Loja</h5>
            
            <h6 style={{color: 'black', fontFamily: 'bungee', textAlign: 'center', marginTop: '10px' }}>
                Sem créditos? Faça sua compra aqui com PagSeguro!&nbsp;&nbsp;&nbsp;&nbsp;
                <a href="https://pag.ae/7ZrH2dwNL/button" rel="noopener" target="_blank" title="Pagar com PagSeguro">
                    <img src="//assets.pagseguro.com.br/ps-integration-assets/botoes/pagamentos/95x45-pagar-azul.gif" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
                </a>
            </h6>

            {!carregouTemas && <div className='d-flex justify-content-center w-100'>
                <CircularProgress />
            </div>}
            {carregouTemas && lTemas.length > 0 && <>
                <div className="row" >
                    {temasPaginados.map(iResumoTema => {
                        return (<div className='col-6' key={iResumoTema.id}>
                            <Card style={{marginTop: '10px'}}>
                                <CardContent >
                                    <h3 className="subtitulo">{iResumoTema.nome}</h3>
                                    <span>{iResumoTema.descricao}</span><br/>
                                    
                                    {/* Previa dos navios */}
                                    <div style={{ position: 'relative' }}>
                                        <PosicaoContainerPrevia idPrefix={'tema_nr_' + iResumoTema.id} />
                                        {iResumoTema.previas.map(iPreviaNavio => {
                                            return (<div key={iPreviaNavio.tamanhoQuadrados} className='d-inline me-3'>
                                                <ImgNavioVertical
                                                    dadosBase64={iPreviaNavio.arquivo?.dadosBase64 ?? ''}
                                                    eSrcBase64={true}
                                                    srcImagem={null}
                                                    tamanhoQuadrados={iPreviaNavio.tamanhoQuadrados}
                                                    altImagem='imagem previa'
                                                    ePositionAbsolute={true}
                                                    cssLeftAsPx={(iPreviaNavio.tamanhoQuadrados - 1)*60}
                                                    cssTopAsPx={0} />
                                            </div>)
                                    })}
                                    </div>
                                </CardContent>
                                <CardActions>
                                    {!carregouEquipacao && <CircularProgress color="success" />}                                        
                                    {carregouEquipacao && iResumoTema.id != idTemaEquipado && <Button size="medium" variant="contained" color="success" onClick={() => handleClickEquipar(iResumoTema.id)}>Equipar</Button>}
                                    {carregouEquipacao && iResumoTema.id == idTemaEquipado && <Button size="medium" color="inherit" disabled>Equipado</Button>}
                                    <Button size="medium" onClick={() => navigate('/loja/detalheTema?id=' + iResumoTema.id)}>Ver mais</Button>
                                </CardActions>
                            </Card>
                        </div>)
                    })}
                </div>
                <div className="d-flex justify-content-center pt-4">
                    <WhitePagination color='standard' variant='outlined' count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
                </div>
            </>}
            {carregouTemas && lTemas.length == 0 && <span style={{color: 'black', fontFamily: 'bungee', display: 'block', textAlign: 'center', marginTop: '30px' }}>Nenhum tema comprado ainda.</span>}
            
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </div>
        
    )
}


export default IndexMochila