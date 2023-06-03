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
import { PostNovaCompra } from '../../modelos/importarBack/PostNovaCompra';
import { LiteralPadroes } from '../../modelos/LiteralPadroes';
import { UtilPagina } from '../../util/UtilPagina';
import AddIcon from '@mui/icons-material/Add';
import FormGroup from '@mui/material/FormGroup';

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

const IndexLoja = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [lTemas, setLTemas] = useState<MdResumoTema[]>([]);
    const [pagina, setPagina] = useState(1);
    const [idTemaConfirmacaoExclusaoPendente, setIdTemaConfirmacaoExclusaoPendente] = useState('');
    const [carregouTemas, setCarregouTemas] = useState(false);

    const [confirmacaoExclusaoEstaAberto, setConfirmacaoExclusaoEstaAberto] = useState(false);
    const [sucessoExclusaoEstaAberto, setSucessoExclusaoEstaAberto] = useState(false);
    const [sucessoCompraEstaAberto, setSucessoCompraEstaAberto] = useState(false);
    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    useEffect(() => {
        clientRest.callGetAutorizado<MdResumoTema[]>('/api/tema/listar', [])
            .then(rLista => {
                if (rLista.eOk) {
                    setLTemas(rLista.body ?? []);
                    setCarregouTemas(_ => true);
                } else {
                    setProblemaErro(rLista.problema);
                    setErroEstaAberto(_ => true);
                }
            });
        
    }, []);

    let qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6);
    // useEffect(() => { qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6); }, [lTemas])

    let temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 6);
    // useEffect(() => { temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 6); }, [lTemas, pagina])
    // console.log(qtPaginas);
    
    const handleClickExcluir = (idTema: string) => {
        setIdTemaConfirmacaoExclusaoPendente(_ => idTema);
        setConfirmacaoExclusaoEstaAberto(_ => true);
    }

    const handleClickConfirmarExclusao = async () => {
        const rExclusao = await clientRest.callDeleteAutorizado<undefined>('/api/tema/excluirPorId?id=' + idTemaConfirmacaoExclusaoPendente, undefined);
        setConfirmacaoExclusaoEstaAberto(_ => false);
        
        if (rExclusao.eOk) {
            setSucessoExclusaoEstaAberto(_ => true);
        } else {
            setProblemaErro(rExclusao.problema);
            setErroEstaAberto(_ => true);
        }
    }
    
    const handleClickComprar = async (idTema: string) => {
        const novaCompra = new PostNovaCompra();
        novaCompra.idTema = idTema;
        const rCompra = await clientRest.callPostAutorizado<string>('/api/compra/adicionar', novaCompra, '');
        
        if (rCompra.eOk) {
            setSucessoCompraEstaAberto(_ => true);
        } else {
            setProblemaErro(rCompra.problema);
            setErroEstaAberto(_ => true);
        }

        let userToChange = userState.localStorageUser;
        if (userToChange == null)
            return;
        userState.localStorageUser = userToChange;
    }
    
    return (
        <div>
            <h1 style={{color: 'black', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>Loja</h1>
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
                                                {/* <img
                                                    src={'data:image/*;base64,' + (iPreviaNavio.arquivo?.dadosBase64 ?? '')}
                                                    alt='imagem previa' /> */}
                                            </div>)
                                    })}
                                    </div>
                                </CardContent>
                                <CardActions>
                                    {iResumoTema.id == LiteralPadroes.IdTemaPadrao && <Button size="medium" color="inherit" disabled>Padrão</Button>}
                                    {iResumoTema.id != LiteralPadroes.IdTemaPadrao && <>
                                        {!iResumoTema.foiCompradoPorUsuarioLogado && <Button size="medium" variant="contained" onClick={() => handleClickComprar(iResumoTema.id)}>{'Comprar - R$ ' + iResumoTema.preco}</Button>}
                                        {iResumoTema.foiCompradoPorUsuarioLogado && <Button size="medium" color="inherit" disabled>Comprado</Button>}
                                    </>}
                                    <Button size="medium" onClick={() => navigate('/loja/detalheTema?id=' + iResumoTema.id)}>Ver mais</Button>
                                    {(userState.localStorageUser?.eSuperuser ?? true) && <Button size="medium" variant="contained" onClick={() => navigate('/loja/detalheTema?id=' + iResumoTema.id + '&eAlteracao=S')}>Alterar</Button>}
                                    {iResumoTema.id != LiteralPadroes.IdTemaPadrao && (userState.localStorageUser?.eSuperuser ?? true) && <Button size="medium" variant="contained" color="error" onClick={() => handleClickExcluir(iResumoTema.id)}>Excluir</Button>}
                                </CardActions>
                            </Card>
                        </div>)
                    })}
                </div>
                <div className="d-flex justify-content-center pt-4">
                    <WhitePagination color='standard' variant='outlined' count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
                </div>
            </>}
            {carregouTemas && lTemas.length == 0 && <span style={{color: 'black', fontFamily: 'bungee', display: 'block', textAlign: 'center', marginTop: '30px' }}>Nenhum tema adicionado ainda.</span>}
           {(userState.localStorageUser?.eSuperuser ?? true) && <FormGroup>
            <div className="d-flex justify-content-center pt-4">
                <Fab size="medium" variant='extended'  onClick={() => navigate('/loja/adicionarTema')}> Adicionar tema <AddIcon sx={{mr: 1}} style={{marginBottom: '5px'}}/></Fab>
            </div>
            </FormGroup>}

            <ConfirmacaoModal estaAberto={confirmacaoExclusaoEstaAberto} onFecharOuCancelar={() => setConfirmacaoExclusaoEstaAberto(_ => false)} onConfirmar={() => handleClickConfirmarExclusao()}
                mensagem='Deseja excluir este tema? Isso causará a exclusão das personalizações deste tema.' />
            <SucessoModal estaAberto={sucessoExclusaoEstaAberto} onFechar={() => window.location.reload()} mensagem='Tema excluído com sucesso!' />
            <SucessoModal estaAberto={sucessoCompraEstaAberto} onFechar={() => window.location.reload()} mensagem='Tema comprado com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
            <div className='payment_button'>
                <a href="https://pag.ae/7ZrH2dwNL/button" rel="noopener" target="_blank" title="Pagar com PagSeguro"><img src="//assets.pagseguro.com.br/ps-integration-assets/botoes/pagamentos/95x45-pagar-azul.gif" alt="Pague com PagSeguro - é rápido, grátis e seguro!" /></a>
                </div>
        </div>
    ) 
}


export default IndexLoja
