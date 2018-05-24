import PubSub from 'pubsub-js';

export default class LogicaTimeline {

  constructor(fotos) {
    this.fotos = fotos;
  }

  lista(urlPerfil) {
    fetch(urlPerfil)
    .then(response => response.json())
    .then(fotos => {
      this.fotos = fotos;
      PubSub.publish('timeline', this.fotos);
    });
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
      const fotoAchada = this.fotos.find(foto => foto.id === fotoId);
      fotoAchada.likeada = !fotoAchada.likeada;
      
      const possivelLiker = fotoAchada.likers.find(likerAtual => likerAtual.login === liker.login);
      if(possivelLiker === undefined){
        fotoAchada.likers.push(liker);
      }else{
        const novosLikers = fotoAchada.likers.filter(likerAtual => likerAtual.login !== liker.login);
        fotoAchada.likers = novosLikers;
      }
      PubSub.publish('timeline', this.fotos);
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
      const fotoAchada = this.fotos.find(foto => foto.id === fotoId);
      fotoAchada.comentarios.push(novoComentario);
      PubSub.publish('timeline', this.fotos);
    });
  }

  subscribe(callback) {
    PubSub.subscribe('timeline', (nomeTopico, fotos) => {
      callback(fotos);
    });
  }
}