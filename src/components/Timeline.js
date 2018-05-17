import React, { Component } from 'react';
import FotoItem from './Foto'
import PubSub from 'pubsub-js';

export default class Timeline extends Component {

  constructor(props) {
    super(props);
    this.state = {fotos: []};
    this.login = this.props.login;
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
    .then(fotos => this.setState({fotos: fotos}) );
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

    PubSub.subscribe('atualiza-liker', (nomeTopico, infoLiker) => {
      const fotoAchada = this.state.fotos.find(foto => foto.id === infoLiker.fotoId);
      fotoAchada.likeada = !fotoAchada.likeada;
      
      const possivelLiker = fotoAchada.likers.find(liker => liker.login === infoLiker.liker.login);
      if(possivelLiker === undefined){
        fotoAchada.likers.push(infoLiker.liker);
      }else{
        const novosLikers = fotoAchada.likers.filter(liker => liker.login !== infoLiker.liker.login);
        fotoAchada.likers = novosLikers;
      }
      this.setState({fotos: this.state.fotos});
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
    let api = `http://localhost:8080/api/fotos/${fotoId}/like?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`;
    fetch(api, {method: 'POST'})
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw new Error("não foi possível realizar o like da foto");
        }
    })
    .then(liker => {
      PubSub.publish('atualiza-liker', { fotoId, liker });
    });
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
                                                 like={this.like}
                                                 comenta={this.comenta}/>)
        }
      </div>
    );
  }

}