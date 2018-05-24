import React, { Component } from 'react';
import FotoItem from './Foto'

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

    this.props.store.lista(urlPerfil);
  }

  // https://jwt.io/
  componentDidMount(){
    this.carregaFotos();
  }

  //Quando usa PubSub o subscribe normalmente é no componentWillMount
  componentWillMount() {
    this.props.store.subscribe(fotos => {
      this.setState({fotos});
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.login !== undefined){
      this.login = nextProps.lgin;
      this.carregaFotos();
    }
  }

  like(fotoId) {
    this.props.store.like(fotoId);
  }

  comenta(fotoId, textoDoComentario) {
    this.props.store.comenta(fotoId, textoDoComentario);
  }

  render() {
    return(
      <div className="fotos container">
        {
          this.state.fotos.map(foto => <FotoItem key={foto.id} 
                                                 foto={foto} 
                                                 like={this.like.bind(this)}
                                                 comenta={this.comenta.bind(this)}/>)
        }
      </div>
    );
  }

}