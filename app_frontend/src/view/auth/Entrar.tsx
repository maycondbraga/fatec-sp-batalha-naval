import { Button, Card, CardActions, CardContent, styled, TextField } from "@mui/material";
import ErroModal from "../../components/erroModal/ErroModal";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import GoogleAuthBotao from '../../components/GoogleAuthBotao';
import "./Entrar.css";
import { PostCadastroUsuario } from "../../modelos/importarBack/PostCadastroUsuario";
import { PostLoginUsuario } from "../../modelos/importarBack/PostLoginUsuario";
import ClientRest from "../../integracao/ClientRest";
import { MdUsuarioLogado } from "../../modelos/importarBack/MdUsuarioLogado";
import UserState from "../../integracao/UserState";



function IsEmail(validarEmail: string){
    var exclude=/\[^@-.w]|^[_@.-]|[._-]{2}|[@.]{2}|(@)[^@]*1/;
    var check=/\@[w-]+./;
    var checkend=/\.[a-zA-Z]{2,3}$/;
    if(((validarEmail.search(exclude) != -1)||(validarEmail.search(check)) == -1)||(validarEmail.search(checkend) == -1)){return false;}
    else {return true;}
}

function FuncaoValidarEmail(email: string) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  function FuncaoValidarNome(nomeV: string){
    return !nomeV.match(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/);
}

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius:'10px',
        /*A primeira implementação da linha abaixo fez com
        que a fonte dentro do input sumisse. Ponto a ver posteriormente.*/
        /*backgroundColor: 'white',*/
    }
});

const Entrar = () => {
    const navigate = useNavigate();

    const clientRest = new ClientRest();
    const userState = new UserState();

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const handleFecharErro = () => {
        setErroEstaAberto(_ => false);
    }

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleChangeEmail = (arg: string) => {
        setEmail(_ => arg);
    }
    const handleChangeSenha = (arg: string) => {
        setSenha(_ => arg);
    }
    const handleClickEntrarUsuarioEncVn = async () => {
        let loginUsuario = new PostLoginUsuario();
        loginUsuario.email = email;
        loginUsuario.senha = senha;
        const respostaLogin = await clientRest.callPost<MdUsuarioLogado>('/api/autorizacao/entrarUsuarioEncVn', loginUsuario, new MdUsuarioLogado());
        
        if (respostaLogin.eOk) {
            userState.localStorageUser = respostaLogin.body;
            navigate('/');
            window.location.reload();
        } else {
            setProblemaErro(_ => respostaLogin.problema);
            setErroEstaAberto(_ => true);
        }
    }
    const [eTelaEntrar, setETelaEntrar] = useState(true);
    const handleClickCriarConta = () => {
        setETelaEntrar(_ => false);
    }

    const [nomeCadastro, setNomeCadastro] = useState('');
    const [emailCadastro, setEmailCadastro] = useState('');
    const [senhaCadastro, setSenhaCadastro] = useState('');

    useEffect(() => {
        let divRoot = document.getElementById("root");
        divRoot!.style.backgroundImage = "none";
    }, [])

    const handleChangeNomeCadastro = (arg: string) => {
        setNomeCadastro(_ => arg);
    }
    const handleChangeEmailCadastro = (arg: string) => {
        setEmailCadastro(_ => arg);}

    const handleChangeSenhaCadastro = (arg: string) => {
        setSenhaCadastro(_ => arg);
    }
    const handleClickCriarContaCadastro = async () => {

  
        let cadastroUsuario = new PostCadastroUsuario();
        cadastroUsuario.nome = nomeCadastro;
        cadastroUsuario.email = emailCadastro;
        let validarEmail = cadastroUsuario.email;
        let validarNome = cadastroUsuario.nome;

        if(FuncaoValidarNome(validarNome)){
            setProblemaErro(_ => 'O nome não pode ter números ou caracteres especiais.');
            setErroEstaAberto(_ => true);
            return;
        }
        if(!(FuncaoValidarEmail(validarEmail))){
            
            setProblemaErro(_ => 'O email está no formato inválido.');
            setErroEstaAberto(_ => true);
            return;
        }

        cadastroUsuario.nome = nomeCadastro;
        cadastroUsuario.email = emailCadastro;
        cadastroUsuario.senha = senhaCadastro;
        
        const respostaCadastro = await clientRest.callPost<MdUsuarioLogado>('/api/autorizacao/cadastrarUsuarioEncVn', cadastroUsuario, new MdUsuarioLogado());

       
        if (respostaCadastro.eOk) {
            userState.localStorageUser = respostaCadastro.body;
            setETelaEntrar(_ => true);
        } else {
            setProblemaErro(_ => respostaCadastro.problema);
            setErroEstaAberto(_ => true);
        }

    }
    const handleClickJaTenhoContaCadastro = () => {
        setETelaEntrar(_ => true);
    }

    return (
        <>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Righteous"></link>
                <div>
                    <div className='titulo-wrapper'>
                        <img id='logo-entrar' src="/assets/logo_navio-removebg-preview.png" />
                    </div>
                    <div className="d-flex justify-content-center">
                        <div className="col-6 pe-3">
                            {eTelaEntrar ?
                                <Card className="shadow-none">
                                    <CardContent>
                                        <h3 className="subtitulo">LOGIN</h3>
                                        <div className="d-flex flex-column align-items-center">
                                            <EncVnTextField label="Email" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeEmail(ev.target.value)} value={email} />
                                            <EncVnTextField label="Senha" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeSenha(ev.target.value)} value={senha} />
                                            <Button variant="contained" size="medium" className="mt-4" sx={{ width: 200 }} onClick={() => handleClickEntrarUsuarioEncVn()}>Entrar</Button>
                                            {/* <GoogleAuthBotao /> */}
                                        </div>
                                    </CardContent>
                                    <CardActions className="d-flex justify-content-center">
                                        <Button size="medium" onClick={() => handleClickCriarConta()}>Novo por aqui? Cadastre-se já!</Button>
                                    </CardActions>
                                </Card> :
                                <Card className="shadow-none">
                                    <CardContent>
                                        <h3 className="subtitulo">CADASTRAR</h3>
                                        <div className="d-flex flex-column align-items-center">
                                            <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeNomeCadastro(ev.target.value)} value={nomeCadastro} />
                                            <EncVnTextField label="Email" type="email" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeEmailCadastro(ev.target.value)} value={emailCadastro} />
                                            <EncVnTextField label="Senha" type="password" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => handleChangeSenhaCadastro(ev.target.value)} value={senhaCadastro} />
                                            <Button variant="contained" size="medium" className="mt-4" sx={{ width: 200 }} onClick={() => handleClickCriarContaCadastro()}>Criar a conta</Button>
                                        </div>
                                    </CardContent>
                                    <CardActions className="d-flex justify-content-center">
                                        <Button size="medium" onClick={() => handleClickJaTenhoContaCadastro()}>Logar com uma conta existente</Button>
                                    </CardActions>
                                </Card>}
                        </div>
                    </div>
                </div> 
            <ErroModal estaAberto={erroEstaAberto} onFechar={handleFecharErro} problema={problemaErro} />
        </>
    )

}

export default Entrar