import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Login from './components/Login';
import {Router, Route, browserHistory} from 'react-router';
import Logout from './components/Logout';
import {matchPattern} from 'react-router/lib/PatternUtils';
import registerServiceWorker from './registerServiceWorker';

import './css/reset.css'
import './css/timeline.css'
import './css/login.css'

//Verifica se o usuário está autenticado
function verificaAutenticacao(nextState, replace) {
  const resultado = matchPattern('/timeline(/:login)',nextState.location.pathname);
  const enderecoPrivadoTimeline = resultado.paramValues[0] === undefined;
  console.log(resultado);


  if(enderecoPrivadoTimeline && localStorage.getItem('auth-token') === null){
    replace('/?msg=você precisa estar logado para acessar a aplicação.');
  }
}

ReactDOM.render(
  (<Router history={browserHistory}>
    <Route path="/" component={Login}></Route>
    <Route path="/timeline(/:login)" component={App} onEnter={verificaAutenticacao}></Route>
    <Route path="/logout" component={Logout}></Route>
  </Router>),
  document.getElementById('root')
);
registerServiceWorker();
