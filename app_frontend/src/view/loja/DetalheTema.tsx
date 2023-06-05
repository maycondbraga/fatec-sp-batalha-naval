import { Box, Button, Dialog, DialogActions, DialogContent, styled, Tab, Tabs, TextField, InputAdornment } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { MdDetalheTema } from '../../modelos/importarBack/MdDetalheTema';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { PutNavioTema } from '../../modelos/importarBack/PutNavioTema';
import { PutTema } from '../../modelos/importarBack/PutTema';
import { UtilNumber } from '../../util/UtilNumber';
import ManterListaNavioTema from './ManterListaNavioTema';
import MdRespostaApi from '../../modelos/MdRespostaApi';
import '../css/DetalheTema.css';
import FormGroup from '@mui/material/FormGroup';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const DetalheTema = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState<number | null>(null);
    const [descricao, setDescricao] = useState('');
    const [bytesTemaImagem, setBytesTemaImagem] = useState<Blob | null>(null);
    // const [idxTab, setIdxTab] = useState(0);
    const [popupNaviosTemaEstaAberto, setPopupNaviosTemaEstaAberto] = useState(false);
    const [lNaviosTema, setLNaviosTema] = useState<MdDetalheNavioTema[]>([]);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [sucessoAlteracaoEstaAberto, setSucessoAlteracaoEstaAberto] = useState(false);

    const calcularSrcTemaImagemPrevia = (): string => {
        if (bytesTemaImagem != null)
            return URL.createObjectURL(bytesTemaImagem);
        return '';
    }
    
    const [srcTemaImagemPrevia, setSrcTemaImagemPrevia] = useState(calcularSrcTemaImagemPrevia());
    useEffect(() => setSrcTemaImagemPrevia(calcularSrcTemaImagemPrevia()), [bytesTemaImagem]);

    let eAlteracao = searchParams.get('eAlteracao') == 'S';
    useEffect(() => {
        const tryIdTema = searchParams.get('id');
        if (tryIdTema == null) {
            setProblemaErro(_ => 'Tema não encontrado');
            setErroEstaAberto(_ => true);
        } else {
            clientRest.callGetAutorizado<MdDetalheTema>('/api/tema/detalharPorId?id=' + tryIdTema, new MdDetalheTema())
                .then(rDetalhe => {
                    if (rDetalhe.eOk) {
                        const detalheTema = rDetalhe.body ?? new MdDetalheTema();
                        setNome(_ => detalheTema.nome);
                        setPreco(_ => detalheTema.preco);
                        setDescricao(_ => detalheTema.descricao);

                        if (detalheTema.fundoTela != ''){
                            fetch(detalheTema.fundoTela)
                            .then(res => res.blob())
                            .then(blob => setBytesTemaImagem(_ => blob));
                        }

                        setLNaviosTema(_ => detalheTema.naviosTema);
                    } else {
                        setProblemaErro(rDetalhe.problema);
                        setErroEstaAberto(_ => true);
                    }
                });
        }
    }, []);

    const handleTemaArquivoSelecionado = (event: any) => {
        setBytesTemaImagem(_ => event.target.files[0]);
    }

    const formatarPreco = (precoRaw: number | null): string => {
        if (precoRaw == null) {
            return '';
        }
        return ('' + precoRaw);
    }
    
    const validarNavios = (navios: MdDetalheNavioTema[])=>{
        if (navios.some((navio) => navio.tamnQuadrados == 4) &&
            navios.some((navio) => navio.tamnQuadrados == 3) &&
            navios.some((navio) => navio.tamnQuadrados == 2) &&
            navios.some((navio) => navio.tamnQuadrados == 1)){
                return true
            }
        else{
            return false
        }
    }

    async function blobToBase64Async(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onerror = (e) => reject(fileReader.error);
          fileReader.onloadend = (e) => {
            const dataUrl = fileReader.result as string;
            resolve(dataUrl);
          };
          fileReader.readAsDataURL(blob);
        });
    }

    let precoAsFormatado = formatarPreco(preco);
    // useEffect(() => { precoAsFormatado = formatarPreco(preco) }, [preco]);

    const handleClickSalvar = async () => {
        const tryIdTema = searchParams.get('id');
        if (!validarNavios(lNaviosTema)){
            setProblemaErro(_ => 'Faltam objetos a serem adicionados');
            setErroEstaAberto(_ => true);
            return;
        }
        if (bytesTemaImagem == null || bytesTemaImagem.size <= 0){
            setProblemaErro(_ => 'É necessário ter um tema de fundo de tela selecionado.');
            setErroEstaAberto(_ => true);
            return;
        }
        if (tryIdTema == null) {
            setProblemaErro(_ => 'Tema não encontrado');
            setErroEstaAberto(_ => true);
            return;
        }
        let temaAlterado = new PutTema();
        temaAlterado.id = tryIdTema;
        temaAlterado.nome = nome;
        temaAlterado.preco = preco;
        temaAlterado.descricao = descricao;

        let promisesParaResolver: Promise<MdRespostaApi<undefined>>[] = [];
        for (let iDetalheTema of lNaviosTema) {
            let navioTemaParaPush = new PutNavioTema();
            navioTemaParaPush.id = iDetalheTema.id;
            navioTemaParaPush.tamnQuadrados = iDetalheTema.tamnQuadrados;
            navioTemaParaPush.nomePersonalizado = iDetalheTema.nomePersonalizado;
            navioTemaParaPush.numeroRecuperacaoArquivoImagemNavio = iDetalheTema.numeroRecuperacaoArquivoImagemNavio ?? '';
            // Se os bytes foram informados, significa upload novo
            // Se os bytes nao foram informados, significa que nao mudou a imagem -> adicionar mesmo assim na lista de naviosTema
            if (iDetalheTema.bytesParaUploadArquivo != null)
                promisesParaResolver.push(clientRest.callUploadArquivo(iDetalheTema.bytesParaUploadArquivo, iDetalheTema.numeroRecuperacaoArquivoImagemNavio ?? ''));
            temaAlterado.naviosTema.push(navioTemaParaPush);
        }
        let listaRUpload = await Promise.all(promisesParaResolver);
        let rErroOrDefault = listaRUpload.find(x => !x.eOk);
        if (rErroOrDefault != undefined) {
            setProblemaErro(_ => rErroOrDefault?.problema ?? '');
            setErroEstaAberto(_ => true);
            return;
        }
        
        const base64 = await blobToBase64Async(bytesTemaImagem);
        temaAlterado.fundoTela = base64;

        let rAlteracao = await clientRest.callPutAutorizado<undefined>('/api/tema/alterar', temaAlterado, undefined);
        if (rAlteracao.eOk) {
            setSucessoAlteracaoEstaAberto(_ => true);
        } else {
            setProblemaErro(_ => rAlteracao.problema);
            setErroEstaAberto(_ => true);
        }
        
    }

    const handleClickAlterar = () => {
        if (searchParams.has('eAlteracao')) {
            searchParams.set('eAlteracao', 'S');
        } else {
            searchParams.append('eAlteracao', 'S');
        }
        setSearchParams(_ => searchParams);
    }

    return (
        <>
            <h1 style={{color: 'black', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>{eAlteracao ? 'Alterar Tema' : 'Detalhes do Tema'}</h1>

            <Box className='box'>
                {/* <Tabs value={idxTab} onChange={(ev, nextIdxTab) => setIdxTab(_ => nextIdxTab)} aria-label="basic tabs example">
                    <Tab label="Dados de Resumo" />
                    <Tab label="Navios" />
                </Tabs>
                {idxTab == 0 && <> */}
                    <div className="row g-0" >
                        <div className="col-6">
                            <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNome(_ => ev.target.value)} value={nome} disabled={!eAlteracao} />

                            <EncVnTextField label="Preço" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setPreco(_ => UtilNumber.parseFloatOrDefault(ev.target.value))} value={precoAsFormatado} disabled={!eAlteracao}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            }} />

                            <EncVnTextField multiline rows={4} label="Descrição" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setDescricao(_ => ev.target.value)} value={descricao} disabled={!eAlteracao} />

                            {/* Botao de upload */}
                            {eAlteracao ? 
                                <div className="d-flex mt-3 align-items-center" style={{ margin: '5px' }}>
                                    <span>Tema de fundo de tela:</span>
                                    <label htmlFor="btn-upload-alt-tema" className="ms-3">
                                        <input
                                        id="btn-upload-alt-tema"
                                        name="btn-upload-alt-tema"
                                        style={{ display: 'none' }}
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleTemaArquivoSelecionado} /> 
                                        <Button
                                        className="btn-choose"
                                        variant="outlined"
                                        component="span" >
                                            Escolher Arquivo
                                        </Button>
                                    </label>
                                </div>
                            : null}
                        </div>
                        <div className="col-6">
                            <div className="row g-0 mt-3">
                                {bytesTemaImagem == null ? null : <h6 style={{color: 'black', fontFamily: 'bungee', marginTop: '5px' }}>Fundo de tela:</h6>}
                                {bytesTemaImagem == null ? null : <img src={srcTemaImagemPrevia} style={{ maxHeight: '100%', maxWidth: '100%', marginTop: '10px' }} />}
                            </div>
                        </div>
                    </div>
                {/* </>} */}
                {/* {idxTab == 1 && <ManterListaNavioTema lNaviosTema={lNaviosTema} setLNaviosTema={setLNaviosTema} />} */}
                <div className="row g-0">
                    <div className="col-11" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => setPopupNaviosTemaEstaAberto(_ => true)}>Abrir Lista de Personalizações</Button>
                    </div>
                    <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                    </div>
                    {eAlteracao && <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => handleClickSalvar()}>Salvar</Button>
                    </div>}
                    {(userState.localStorageUser?.eSuperuser ?? true) && <FormGroup>
                    {!eAlteracao && <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => handleClickAlterar()}>Alterar</Button>
                    </div>}
                    </FormGroup>}

                </div>
            </Box>

            {/* Pop Up com os NavioTema */}
            <Dialog
                open={popupNaviosTemaEstaAberto}
                onClose={() => setPopupNaviosTemaEstaAberto(_ => false)}
                fullWidth
                maxWidth='lg'
            >
                <DialogContent>
                    <ManterListaNavioTema lNaviosTema={lNaviosTema} setLNaviosTema={setLNaviosTema} eListaBloqueada={!eAlteracao} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPopupNaviosTemaEstaAberto(_ => false)}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mensagens de sucesso e erro */}
            <SucessoModal estaAberto={sucessoAlteracaoEstaAberto} onFechar={() => navigate('/loja')} mensagem='Tema alterado com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default DetalheTema
