import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Login from './components/Login';
import {Router, Route, browserHistory} from 'react-router';
import registerServiceWorker from './registerServiceWorker';

import './css/reset.css'
import './css/timeline.css'
import './css/login.css'

//Verifica se o usuário está autenticado
function verificaAutenticacao(nextState, replace) {
  if(localStorage.getItem('auth-token') === null){
    replace('/?msg=você precisa estar logado para acessar a aplicação.');

  }
}

ReactDOM.render(
  (<Router history={browserHistory}>
    <Route path="/" component={Login}></Route>
    <Route path="/timeline" component={App} onEnter={verificaAutenticacao}></Route>
  </Router>),
  document.getElementById('root')
);
registerServiceWorker();
