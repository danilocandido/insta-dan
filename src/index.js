import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Login from './components/Login';
import {Router, Route, browserHistory} from 'react-router';
import registerServiceWorker from './registerServiceWorker';

import './css/reset.css'
import './css/timeline.css'
import './css/login.css'

ReactDOM.render(
  (<Router history={browserHistory}>
    <Route path="/" component={Login}></Route>
    <Route path="/timeline" component={App}></Route>
  </Router>), 
  document.getElementById('root')
);
registerServiceWorker();
