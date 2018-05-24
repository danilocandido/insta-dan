import React, { Component } from 'react';
import FotoItem from './Foto'
import PubSub from 'pubsub-js';
import LogicaTimeline from '../logicas/LogicaTimeline';

export default class Timeline extends Component {

  constructor(props) {
    super(props);
    this.state = {fotos: []};
    this.login = this.props.login;
    this.logicaTimeline = new LogicaTimeline([]);
  }

  carregaFotos(){
    let urlPerfil;

    if(this.login === undefined){
      urlPerfil = `http://localhost:8080/api/fotos?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`
    }else{
      urlPerfil = `http://localhost:8080/api/public/fotos/${this.login}`;
    }

    fetch(urlPerfil)
    .then(response => response.json())
    .then(fotos => {
      this.setState({fotos: fotos})
      this.logicaTimeline = new LogicaTimeline(fotos);
    });
  }

  // https://jwt.io/
  componentDidMount(){
    this.carregaFotos();
  }

  //Quando usa PubSub o subscribe normalmente é no componentWillMount
  componentWillMount() {
    PubSub.subscribe('timeline', (nomeTopico, timeline) => {
      this.setState({fotos: timeline});
    });

    PubSub.subscribe('novos-comentarios', (nomeTopico, infoComentario) =>{
      const fotoAchada = this.state.fotos.find(foto => foto.id === infoComentario.fotoId);
      fotoAchada.comentarios.push(infoComentario.novoComentario);
      this.setState({fotos: this.state.fotos});
    }); 
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.login !== undefined){
      this.login = nextProps.lgin;
      this.carregaFotos();
    }
  }

  like(fotoId) {
    this.logicaTimeline.like(fotoId);
  }

  comenta(fotoId, textoDoComentario) {
    let requestInfo = {
      method: 'POST',
      body: JSON.stringify({ texto: textoDoComentario }),
      headers: new Headers({
        'Content-type': 'application/json'
      })
    };

    fetch(`http://localhost:8080/api/fotos/${fotoId}/comment?X-AUTH-TOKEN=${localStorage.getItem('auth-token',requestInfo)}`, requestInfo)
    .then(response => {
      if(response.ok){
        return response.json();
      }else{
        throw new Error('Não foi possível comentar');
      }
    })
    .then(novoComentario => {
      PubSub.publish('novos-comentarios', {fotoId, novoComentario });
    });
  }

  render() {
    return(
      <div className="fotos container">
        {
          this.state.fotos.map(foto => <FotoItem key={foto.id} 
                                                 foto={foto} 
                                                 like={this.like.bind(this)}
                                                 comenta={this.comenta}/>)
        }
      </div>
    );
  }

}