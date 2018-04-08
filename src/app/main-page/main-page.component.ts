import { Component, OnInit } from '@angular/core';
import * as go from 'gojs';

class Promenna {
  nazev;
  domena: Array<Number>;
  omezeni;
  pozice;
  zalohaDomeny;
  constructor(nazev, domena, omezeni) {
    this.nazev = nazev;
    this.domena = domena || [];
    this.omezeni = omezeni || [];
    this.pozice = -1;
    this.zalohaDomeny = [];
  }
  vratPrirazenouHodnotu() {
    return this.domena[this.pozice];
  }
  
  set domenaText(value: string) {
    this.domena = [parseInt(value)];
  }
  
  get domenaText() {
    return this.domena.toString();
  }
}

class Omezeni {
  typOmezeni;
  hodnotyOmezeni;
  omezeniProPromennou;
  constructor(typOmezeni, hodnotyOmezeni, omezeniProPromennou) {
    this.typOmezeni = typOmezeni;
    this.hodnotyOmezeni = hodnotyOmezeni;
    this.omezeniProPromennou = omezeniProPromennou;
  }
}

class KrokAlgoritmu {
  promenna;
  nazev;
  hodnota;
  rodic;
  popis;
  stav;
  hodnotaDomenKroku = new Array();
};

interface ListPromennych {
  promenna: Array<Promenna>;
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})


export class MainPageComponent implements OnInit {

  listPromennych = [];
  vybranaPromenna = {};
  upravenaVybranaPromenna = {};
  index;
  selectedAlgorithm = 'Backtracking';
  display = 'none';

  postup;
  graf;

  numberPattern = new RegExp('^[\\d,]+');

  constructor() { }


  ngOnInit() {
    for (var i = 0; i < 3; i++) {
      this.listPromennych.push(new Promenna(this.generateIdentifier(), [i + 1, i + 2, i + 4], null));
    }

    const a = this.listPromennych[0];
    const ogt = new Omezeni('<', 'B', null);
    const one = new Omezeni('!=', 'C', null);
    const op = new Omezeni('p', [[4, 5], [2, 1]], 'B');
    a.omezeni = [ogt, one, op];


    this.backtracking(3, this.listPromennych);
    this.initGraph();
  }

  algorithmSelect(event: any) {
    this.selectedAlgorithm = event.target.value;
  }

  pridejPromennou() {
    const promenna = new Promenna(this.generateIdentifier(), [], null);
    this.listPromennych.push(promenna);
  }

  odeberPromennou(promenna) {
    const index = this.listPromennych.indexOf(promenna);
    if (index !== -1) {
      this.listPromennych.splice(index, 1);
    }
  }

  openModal(i: number) {
    this.vybranaPromenna = this.listPromennych[i];
    this.upravenaVybranaPromenna = Object.assign({}, this.listPromennych[i]);
    this.index = i;
    this.display = 'block';
  }

  onOKHandled() {
    this.listPromennych[this.index] = Object.assign({}, this.upravenaVybranaPromenna);
    this.upravenaVybranaPromenna = {};
    this.vybranaPromenna = {};
    this.display = 'none';
  }
  onCancelHandled() {
    this.upravenaVybranaPromenna = {};
    this.vybranaPromenna = {};
    this.display = 'none';
  }

  generateIdentifier() {
    if (this.listPromennych.length === 0) {
      return 'A';
    }

    const baseChar = ('A').charCodeAt(0) - 1;
    const lastIdentifier = this.listPromennych[this.listPromennych.length - 1].nazev;
    let lastIdentifierCode = 0;
    for (let length = lastIdentifier.length, i = 0, base = 1; i < length; i++, base *= 27) {
      lastIdentifierCode += base * (lastIdentifier.charCodeAt(length - i - 1) - baseChar);
    }
    lastIdentifierCode++;

    let letters = '';
    do {
      letters = String.fromCharCode(baseChar + Math.max(lastIdentifierCode % 27, 1)) + letters;
      lastIdentifierCode = ((lastIdentifierCode / 27) >> 0); // quick `floor`
    } while (lastIdentifierCode > 0);

    return letters;
  }


  run() {
    switch (this.selectedAlgorithm) {
      case 'Backtracking' : this.backtracking(1, this.listPromennych); break;
      case 'Backjumping' : this.backjumping(1, this.listPromennych); break;
      case 'Forward Check' : this.forwardChecking(1, this.listPromennych); break;
      case 'Arc Consistency' : this.arcConsistency(1, this.listPromennych); break;
      // TODO constraint recording implementation case 'Constraint Recording' : this.(1, this.listPromennych); break;
      default:
    }

    this.reloadGraph();
  }


  backtracking(pozadovanychReseni, seznamPromennych) {
//    seznamPromennych = [];
//    seznamPromennych.push(new Promenna('A', [1, 5], []));
//    seznamPromennych.push(new Promenna('B', [4, 2], [new Omezeni('p', [[4, 5], [2, 1]], 'A')]));
//    seznamPromennych.push(new Promenna('C', [3], [new Omezeni('>', ['A', 'B'], null)]));
//    seznamPromennych.push(new Promenna('D', [4], [new Omezeni('p', [[4, 5], [4, 1]], 'A'), new Omezeni('p', [[4, 4]], 'B')]));
//    seznamPromennych.push(new Promenna('E', [5], [new Omezeni('>', ['A'], null)]));
    // this._prevodOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && pocetReseni < pozadovanychReseni) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice++;
      if (zpracovavanaPromenna.pozice > zpracovavanaPromenna.domena.length - 1) {
        zpracovavanaPromenna.pozice = -1;
        promenna--;
        continue;
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.popis = 'Výběr hodnoty z domény proměnné ' + zpracovavanaPromenna.nazev;
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.promenna = promenna;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = this._lastIndex(promenna - 1, postupTvoreniGrafu) + 1;
      postupTvoreniGrafu.push(krokAlgoritmu);

      var splneniOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (splneniOmezeni.length > 0) {
        krokAlgoritmu.popis += splneniOmezeni;
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          krokAlgoritmu.popis = 'NALEZENO ŘEŠENÍ';
        } else {
          promenna++;
        }
      }

    }
    //smazat
    this.postup=postupTvoreniGrafu;
    return postupTvoreniGrafu;
  }

  backjumping(pozadovanychReseni, seznamPromennych) {
//    seznamPromennych = [];
//    seznamPromennych.push(new Promenna('A', [1, 4], []));
//    seznamPromennych.push(new Promenna('B', [2], []));
//    seznamPromennych.push(new Promenna('C', [3], []));
//    seznamPromennych.push(new Promenna('D', [4], [new Omezeni('=', ['A'], null)]));
//    seznamPromennych.push(new Promenna('E', [5], []));

    //    this._prevodOmezeni(seznamPromennych);

    var leafend = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      leafend.push(false);
    }
    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
    while (pocetReseni < pozadovanychReseni) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      if (promenna === 0) {
        zpracovavanaPromenna.pozice++;
        if (zpracovavanaPromenna.pozice === zpracovavanaPromenna.domena.length) {
          break;
        }
        var krokAlgoritmu = new KrokAlgoritmu();
        krokAlgoritmu.popis = 'Výběr hodnoty z domény proměnné ' + zpracovavanaPromenna.nazev;
        krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
        krokAlgoritmu.promenna = promenna;
        krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
        krokAlgoritmu.rodic = 0;
        postupTvoreniGrafu.push(krokAlgoritmu);
        if (promenna === seznamPromennych.length - 1) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          krokAlgoritmu.popis = 'NALEZENO ŘEŠENÍ';
          leafend[promenna] = true;
        } else {
          leafend[promenna] = true;
          promenna++;
        }
      } else {
        zpracovavanaPromenna.pozice++;
        if (zpracovavanaPromenna.pozice === zpracovavanaPromenna.domena.length) {
          zpracovavanaPromenna.pozice = -1;
          var backjump = 0;
          if (leafend[promenna]) {
            leafend[promenna] = false;
            promenna--;
            continue;
          }
          if (zpracovavanaPromenna.omezeni.length === 0) {
            backjump = promenna - 1;
          } else {
            for (var i = 0; i < zpracovavanaPromenna.omezeni.length; i++) {
              for (var j = 0; j < zpracovavanaPromenna.omezeni[i].length; j++) {
                var whereToJump = this._indexOf(seznamPromennych, zpracovavanaPromenna.omezeni[i][j]);
                if (whereToJump > backjump) {
                  backjump = whereToJump;
                }
                if (zpracovavanaPromenna.typOmezeni[i] === 'p' || zpracovavanaPromenna.typOmezeni[i] === 'z') {
                  break;
                }
              }
            }
          }
          for (var i = promenna; i > backjump; i--) {
            seznamPromennych[i].pozice = -1;
            leafend[i] = false;
          }
          if (krokAlgoritmu.stav !== 'reseni') {
            krokAlgoritmu.stav = 'deadend';
          }
          promenna = backjump;
        } else {
          var krokAlgoritmu = new KrokAlgoritmu();
          krokAlgoritmu.popis = 'Výběr hodnoty z domény proměnné ' + zpracovavanaPromenna.nazev;
          krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
          krokAlgoritmu.promenna = promenna;
          krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
          krokAlgoritmu.rodic = this._lastIndex(promenna - 1, postupTvoreniGrafu) + 1;
          var splneniOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
          if (!(splneniOmezeni.length > 0)) {
            if (promenna === seznamPromennych.length - 1) {
              pocetReseni++;
              krokAlgoritmu.stav = 'reseni';
              krokAlgoritmu.popis = 'NALEZENO ŘEŠENÍ';
              leafend[promenna] = true;
            } else {
              leafend[promenna] = true;
              promenna++;
            }
            postupTvoreniGrafu.push(krokAlgoritmu);
          } else {
            krokAlgoritmu.popis += splneniOmezeni;
            krokAlgoritmu.stav = 'deadend';
            postupTvoreniGrafu.push(krokAlgoritmu);

          }
        }
      }
    }
    return postupTvoreniGrafu;
  }

  forwardChecking(pozadovanychReseni, seznamPromennych) {
//    seznamPromennych = [];
//    seznamPromennych.push(new Promenna('A', [5, 4], []));
//    seznamPromennych.push(new Promenna('B', [2], []));
//    seznamPromennych.push(new Promenna('C', [3], []));
//    seznamPromennych.push(new Promenna('D', [4], []));
//    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni('=', ['A', 'D'], null)]));

    // this._prevodOmezeni(seznamPromennych);

    var vstup = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      vstup.push(seznamPromennych[i].nazev);
    }

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && pocetReseni < pozadovanychReseni) {
      var hodnotyDomen = new Array();
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice++;
      if (zpracovavanaPromenna.pozice > zpracovavanaPromenna.domena.length - 1) {
        zpracovavanaPromenna.pozice = -1;
        if (promenna > 0) {
          seznamPromennych = this._forwardCheckBack(promenna, seznamPromennych, vstup);
        }
        promenna--;
        continue;
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.popis = 'Výběr hodnoty z domény proměnné ' + zpracovavanaPromenna.nazev;
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.promenna = promenna;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = this._lastIndex(promenna - 1, postupTvoreniGrafu) + 1;


      var splneniOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (splneniOmezeni.length > 0) {
        krokAlgoritmu.popis += splneniOmezeni;
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          krokAlgoritmu.popis = 'NALEZENO ŘEŠENÍ';
          krokAlgoritmu.hodnotaDomenKroku = this._forwardChechHodnotaDomen(seznamPromennych);
        } else {
          var tmp = this._forwardCheck(promenna + 1, zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice], seznamPromennych, vstup);
          if (tmp[0] === null) {
            krokAlgoritmu.stav = 'deadend';
          } else {
            seznamPromennych = tmp[0];
            promenna++;
          }
          krokAlgoritmu.hodnotaDomenKroku = tmp[1];
        }
      }
      for (var i = 0; i < seznamPromennych.length; i++) {
        hodnotyDomen.push(seznamPromennych[i].domena.slice());
      }
      postupTvoreniGrafu.push(krokAlgoritmu);
    }
    return postupTvoreniGrafu;
  }

  _forwardCheck(promenna, hodnota, seznamPromennych, vstup) {

    seznamPromennych = this._forwardCheckZaloha(promenna, seznamPromennych, vstup);
    var typOmezeni;
    var hodnotaDomen;
    for (var i = promenna; i < seznamPromennych.length; i++) {
      for (var l = 0; l < seznamPromennych[i].omezeni.length; l++) {
        typOmezeni = seznamPromennych[i].omezeni[l].typOmezeni;
        if (typOmezeni === '<' || typOmezeni === '>' || typOmezeni === '=' || typOmezeni === '!') {
          for (var j = 0; j < seznamPromennych[i].omezeni[l].hodnotyOmezeni.length; j++) {
            if (seznamPromennych[i].omezeni[l].hodnotyOmezeni[j] === vstup[promenna - 1]) {
              switch (typOmezeni) {
                case '<':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (!(seznamPromennych[i].domena[k] < hodnota)) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        return [null, hodnotaDomen];
                      }
                    }
                  }
                  break;
                case '>':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (!(seznamPromennych[i].domena[k] > hodnota)) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        return [null, hodnotaDomen];
                      }
                    }
                  }
                  break;
                case '=':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (hodnota !== seznamPromennych[i].domena[k]) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        return [null, hodnotaDomen];
                      }
                    }
                  }
                  break;
                case '!':
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    if (hodnota === seznamPromennych[i].domena[k]) {
                      seznamPromennych[i].domena.splice(k, 1);
                      k--;
                      if (seznamPromennych[i].domena.length === 0) {
                        hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                        this._forwardCheckBack(promenna, seznamPromennych, vstup);
                        return [null, hodnotaDomen];
                      }
                    }
                  }
                  break;
              }
            }
          }
        } else if (typOmezeni === 'p' || typOmezeni === 'z') {
          if (seznamPromennych[i].omezeni[l][0] === vstup[promenna - 1]) {
            switch (typOmezeni) {
              case 'p':
                var nalezeno;
                for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                  nalezeno = false;
                  for (var j = 0; j < seznamPromennych[i].omezeni[l][1].length; j++) {
                    if (hodnota === parseInt(seznamPromennych[i].omezeni[l][1][j][1])
                      && seznamPromennych[i].domena[k] === seznamPromennych[i].omezeni[l][1][j][0]) {
                      nalezeno = true;
                    }
                  }
                  if (!nalezeno) {
                    seznamPromennych[i].domena.splice(k, 1);
                    k--;
                    if (seznamPromennych[i].domena.length === 0) {
                      hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                      this._forwardCheckBack(promenna, seznamPromennych, vstup);
                      return [null, hodnotaDomen];
                    }
                  }
                }
                break;
              case 'z':
                for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                  for (var k = 0; k < seznamPromennych[i].domena.length; k++) {
                    nalezeno = false;
                    for (var j = 0; j < seznamPromennych[i].omezeni[l][1].length; j++) {
                      if (hodnota === parseInt(seznamPromennych[i].omezeni[l][1][j][1])
                        && seznamPromennych[i].domena[k] === seznamPromennych[i].omezeni[l][1][j][0]) {
                        seznamPromennych[i].domena.splice(k, 1);
                        k--;
                        if (seznamPromennych[i].domena.length === 0) {
                          hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
                          this._forwardCheckBack(promenna, seznamPromennych, vstup);
                          return [null, hodnotaDomen];
                        }
                        break;
                      }
                    }
                  }
                }
                break;
            }
          }
        }
      }
    }
    hodnotaDomen = this._forwardChechHodnotaDomen(seznamPromennych);
    return [seznamPromennych, hodnotaDomen];
  }

  _forwardCheckZaloha(promenna, seznamPromennych, vstup) {
    for (var i = promenna; i < seznamPromennych.length; i++) {
      var a = [vstup[promenna - 1]];
      a.push(seznamPromennych[i].domena.slice());
      seznamPromennych[i].zalohaDomeny.push(a);
    }
    return seznamPromennych;
  }

  _forwardCheckBack(promenna, seznamPromennych, vstup) {
    var predchoziPromenna = vstup[promenna - 1];
    for (var i = promenna; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      var zaloha = promenna.zalohaDomeny;
      var posledniZaloha = zaloha[zaloha.length - 1];
      if (posledniZaloha.length > -1) {
        if (posledniZaloha[0] === predchoziPromenna) {
          promenna.domena = posledniZaloha[1].slice();
          zaloha.pop();
        }
      }
    }
    return seznamPromennych;
  }

  _forwardChechHodnotaDomen(seznamPromennych) {
    var hodnotyDomen = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      hodnotyDomen.push(seznamPromennych[i].domena.slice());
    }
    return hodnotyDomen;
  }

  arcConsistency(pozadovanychReseni, seznamPromennych) {
//    seznamPromennych = [];
//    seznamPromennych.push(new Promenna('A', [5], []));
//    // seznamPromennych.push(new Promenna("A", [5, 4], []))
//    seznamPromennych.push(new Promenna('B', [2], []));
//    seznamPromennych.push(new Promenna('C', [3], []));
//    seznamPromennych.push(new Promenna('D', [4], []));
//    // seznamPromennych.push(new Promenna("E", [1, 2, 3, 4, 5], [new Omezeni("=", ["A", "D"], null)]))
//    // seznamPromennych.push(new Promenna("E", [1, 2, 3, 4, 5], [new Omezeni("p", [[1,1],[2,2],[3,3],[4,4],[5,5]], "A"),new Omezeni("p", [[1,1],[2,2],[3,3],[4,4],[5,5]], "D")]))
//    seznamPromennych.push(new Promenna('E', [4, 5], [new Omezeni('z', [[5, 5]], 'A'), new Omezeni('z', [[4, 4]], 'D')]));


    // this._prevodOmezeni(seznamPromennych);

    var vstup = new Array();
    for (var i = 0; i < seznamPromennych.length; i++) {
      vstup.push(seznamPromennych[i].nazev);
    }
    var pocetVstupu = seznamPromennych.length;
    var zmeneno;
    for (var i = 0; i < pocetVstupu; i++) {
      zmeneno = false;
      var promenna = seznamPromennych[i];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        switch (promenna.omezeni[j].typOmezeni) {
          case '<':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this._valueOf(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              seznamPromennych = this._arcConsistencyGreater(promenna, porovnavanaPromenna, i, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
              seznamPromennych = this._arcConsistencyGreater(porovnavanaPromenna, promenna, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), i, seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
            }
            break;
          case '>':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this._valueOf(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              seznamPromennych = this._arcConsistencyLesser(promenna, porovnavanaPromenna, i, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
              seznamPromennych = this._arcConsistencyLesser(porovnavanaPromenna, promenna, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), i, seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
            }
            break;
          case '=':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this._valueOf(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              seznamPromennych = this._arcConsistencyEqual(promenna, porovnavanaPromenna, i, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
              seznamPromennych = this._arcConsistencyEqual(porovnavanaPromenna, promenna, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), i, seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
            }
            break;
          case '!':
            for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
              var porovnavanaPromenna = this._valueOf(seznamPromennych, promenna.omezeni[j].hodnotyOmezeni[k]);
              seznamPromennych = this._arcConsistencyNotEqual(promenna, porovnavanaPromenna, i, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
              seznamPromennych = this._arcConsistencyNotEqual(porovnavanaPromenna, promenna, vstup.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]), i, seznamPromennych);
              if ((typeof seznamPromennych) === 'string') {
                return seznamPromennych;
              }
            }
            break;
          case 'p':
            var porovnavanaPromenna = this._valueOf(seznamPromennych, promenna.omezeni[j].omezeniProPromennou);
            seznamPromennych = this._arcConsistencyPovoleneDvojice(promenna, porovnavanaPromenna, 0, 1, j, 1, i, promenna.omezeni[j][0], seznamPromennych);
            if ((typeof seznamPromennych) === 'string') {
              return seznamPromennych;
            }
            seznamPromennych = this._arcConsistencyPovoleneDvojice(promenna, porovnavanaPromenna, 1, 0, j, 2, i, promenna.omezeni[j][0], seznamPromennych);
            if ((typeof seznamPromennych) === 'string') {
              return seznamPromennych;
            }
            break;
          case 'z':
            var porovnavanaPromenna = this._valueOf(seznamPromennych, promenna.omezeni[j].omezeniProPromennou);
            seznamPromennych = this._arcConsistencyZakazanDvojice(promenna, porovnavanaPromenna, 0, j, 1, i, promenna.omezeni[j][0], seznamPromennych);
            if ((typeof seznamPromennych) === 'string') {
              return seznamPromennych;
            }
            seznamPromennych = this._arcConsistencyZakazanDvojice(promenna, porovnavanaPromenna, 0, j, 2, i, promenna.omezeni[j][0], seznamPromennych);
            if ((typeof seznamPromennych) === 'string') {
              return seznamPromennych;
            }
            break;
        }
      }
      if (zmeneno) {
        i = -1;
      }
    }
    return this.backtracking(pozadovanychReseni, seznamPromennych);
  }

  // a = prvni promenna prozkoumavanych prvku, b = ddruha promenna
  _arcConsistencyLesser(promennaA, promennaB, idA, idB, seznamPromennych) {
    var remove;
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] < promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        if (promennaA.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
      }
    }
    seznamPromennych[idA] = promennaA;
    seznamPromennych[idB] = promennaB;
    return seznamPromennych;
  }

  _arcConsistencyGreater(promennaA, promennaB, idA, idB, seznamPromennych) {
    var remove;
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] > promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        if (promennaA.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
      }
    }
    seznamPromennych[idA] = promennaA;
    seznamPromennych[idB] = promennaB;
    return seznamPromennych;
  }

  _arcConsistencyEqual(promennaA, promennaB, idA, idB, seznamPromennych) {
    var remove;
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] === promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        if (promennaA.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
      }
    }
    seznamPromennych[idA] = promennaA;
    seznamPromennych[idB] = promennaB;
    return seznamPromennych;
  }

  _arcConsistencyNotEqual(promennaA, promennaB, idA, idB, seznamPromennych) {
    var remove;
    for (var i = 0; i < promennaA.domena.length; i++) {
      remove = true;
      for (var j = 0; j < promennaB.domena.length; j++) {
        if (promennaA.domena[i] !== promennaB.domena[j]) {
          remove = false;
          break;
        }
      }
      if (remove) {
        promennaA.domena.splice(i, 1);
        i--;
        if (promennaA.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
      }
    }
    seznamPromennych[idA] = promennaA;
    seznamPromennych[idB] = promennaB;
    return seznamPromennych;
  }

  // a = prvni promenna prozkoumavanych prvku, b = druha promenna, index = pro
  // ktere omezeni se metoda vykonava, c,d jsou indexy pro hodnotu omezeni pro
  // prvni volani jsou hodnoty c=0,d=1, pro druhe volani jsou tz=tyto hodnoty
  // obracene
  _arcConsistencyPovoleneDvojice(promennaA, promennaB, c, d, index, volani, idA, idB, seznamPromennych) {
    var remove, pomoc;
    var vlastniDvojice = [];
    var indexyHodnot = [];
    if (volani === 1) {
      var domenaA = promennaA.domena;
      var domenaB = promennaB.domena;
    } else {
      var domenaA = promennaB.domena;
      var domenaB = promennaA.domena;
    }

    for (var i = 0; i < promennaA.omezeni[index].hodnotyOmezeni.length; i++) {
      vlastniDvojice.push(parseInt(promennaA.omezeni[index].hodnotyOmezeni[i][c]));
    }

    for (var i = 0; i < domenaA.length; i++) {
      remove = true;
      indexyHodnot = this._indexOfAll(vlastniDvojice, domenaA[i]);
      if (indexyHodnot.length > 0) {
        for (var j = 0; j < indexyHodnot.length; j++) {
          pomoc = parseInt(promennaA.omezeni[index].hodnotyOmezeni[indexyHodnot[j]][d]);
          if (domenaB.indexOf(pomoc) !== -1) {
            remove = false;
            break;
          }
        }
      }
      if (remove && volani === 1) {
        promennaA.domena.splice(i, 1);
        i--;
        if (promennaA.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
      } else if (remove && volani === 2) {
        promennaB.domena.splice(i, 1);
        i--;
        if (promennaB.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
      }
    }
    seznamPromennych[idA] = promennaA;
    seznamPromennych[idB] = promennaB;
    return seznamPromennych;
  }

  _arcConsistencyZakazanDvojice(promennaA, promennaB, d, index, volani, idA, idB, seznamPromennych) {
    var remove, pomoc;
    var vlastniDvojice = [];
    var indexyHodnot = [];
    var povoleneDvojice = [];
    if (volani === 1) {
      var domenaA = promennaA.domena;
      var domenaB = promennaB.domena;
    } else {
      var domenaA = promennaB.domena;
      var domenaB = promennaA.domena;
    }

    for (var i = 0; i < domenaA.length; i++) {
      for (var j = 0; j < domenaB.length; j++) {
        povoleneDvojice.push([parseInt(domenaA[i]), parseInt(domenaB[j])]);
      }
    }

    if (volani === 1) {
      for (var i = 0; i < promennaA.omezeni[index].hodnotyOmezeni.length; i++) {
        vlastniDvojice.push([parseInt(promennaA.omezeni[index].hodnotyOmezeni[i][0]), parseInt(promennaA.omezeni[index].hodnotyOmezeni[i][1])]);
      }
    } else if (volani === 2) {
      for (var i = 0; i < promennaA.omezeni[index].hodnotyOmezeni.length; i++) {
        vlastniDvojice.push([parseInt(promennaA.omezeni[index].hodnotyOmezeni[i][1]), parseInt(promennaA.omezeni[index].hodnotyOmezeni[i][0])]);
      }
    }

    for (var i = 0; i < povoleneDvojice.length; i++) {
      for (var j = 0; j < vlastniDvojice.length; j++) {
        if (vlastniDvojice[j][0] === povoleneDvojice[i][0] && vlastniDvojice[j][1] === povoleneDvojice[i][1]) {
          povoleneDvojice.splice(i, 1);
          i--;
          break;
        }
      }
    }

    vlastniDvojice = [];
    for (var i = 0; i < povoleneDvojice.length; i++) {
      vlastniDvojice.push(povoleneDvojice[i][0]);
      povoleneDvojice[i] = povoleneDvojice[i][1];
    }

    for (var i = 0; i < domenaA.length; i++) {
      remove = true;
      indexyHodnot = this._indexOfAll(vlastniDvojice, parseInt(domenaA[i]));
      if (indexyHodnot.length > 0) {
        for (var j = 0; j < indexyHodnot.length; j++) {
          pomoc = parseInt(povoleneDvojice[indexyHodnot[j]]);
          if (domenaB.indexOf(pomoc) !== -1) {
            remove = false;
            break;
          }
        }
      }
      if (remove && volani === 1) {
        promennaA.domena.splice(i, 1);
        if (promennaA.domena.length === 0) {
          return 'U proměnné ' + promennaA.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
        i--;
      } else if (remove && volani === 2) {
        promennaB.domena.splice(i, 1);
        if (promennaB.domena.length === 0) {
          return 'U proměnné ' + promennaB.nazev + ' vznikla prázdná doména, tudíž pro tento problém neexistuje řešení';
        }
        i--;
      }
    }
    seznamPromennych[idA] = promennaA;
    seznamPromennych[idB] = promennaB;
    return seznamPromennych;
  }

  randomBacktracking(pozadovanychReseni, seznamPromennych) {
    seznamPromennych = [];
    // seznamPromennych.push(new Promenna("A", [1,2,3,4,5], []))
    // seznamPromennych.push(new Promenna("B", [1,2,3,4,5], [new Omezeni("=", ["A"], null)]))
    seznamPromennych.push(new Promenna('A', [1, 2], []));
    seznamPromennych.push(new Promenna('B', [4, 5], [new Omezeni('=', ['A'], null)]));
    seznamPromennych.push(new Promenna('C', [1, 2, 3, 4, 5], []));
    seznamPromennych.push(new Promenna('D', [1, 2, 3, 4, 5], []));
    seznamPromennych.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni('>', ['A'], null)]));
    //this._prevodOmezeni(seznamPromennych);
    seznamPromennych[0].zalohaDomeny = seznamPromennych[0].domena.slice();
    seznamPromennych[1].zalohaDomeny = seznamPromennych[1].domena.slice();
    seznamPromennych[2].zalohaDomeny = seznamPromennych[2].domena.slice();
    seznamPromennych[3].zalohaDomeny = seznamPromennych[3].domena.slice();
    seznamPromennych[4].zalohaDomeny = seznamPromennych[4].domena.slice();

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && pocetReseni < pozadovanychReseni) {
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice = Math.floor(Math.random() * zpracovavanaPromenna.domena.length);
      if (zpracovavanaPromenna.domena.length == 0) {
        zpracovavanaPromenna.pozice = -1;
        zpracovavanaPromenna.domena = zpracovavanaPromenna.zalohaDomeny.slice();
        promenna--;
        continue;
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.popis = 'Výběr hodnoty z domény proměnné ' + zpracovavanaPromenna.nazev;
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.promenna = promenna;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = this._lastIndex(promenna - 1, postupTvoreniGrafu) + 1;
      postupTvoreniGrafu.push(krokAlgoritmu);

      var splneniOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      zpracovavanaPromenna.domena.splice(zpracovavanaPromenna.pozice, 1);
      if (splneniOmezeni.length > 0) {
        krokAlgoritmu.popis += splneniOmezeni;
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          krokAlgoritmu.popis = 'NALEZENO ŘEŠENÍ';
        } else {
          promenna++;
        }
      }

    }
    return postupTvoreniGrafu;
  }

  DynamicOrderBacktracking(pozadovanychReseni, seznamPromennych) {
    seznamPromennych = [];
    seznamPromennych.push(new Promenna('A', [1, 2, 3, 4, 5], []));
    seznamPromennych.push(new Promenna('B', [4, 3, 2], []));
    seznamPromennych.push(new Promenna('C', [3, 1], []));
    seznamPromennych.push(new Promenna('D', [4], []));
    seznamPromennych.push(new Promenna('E', [1, 5], []));

    // this._prevodOmezeni(seznamPromennych);

    var postupTvoreniGrafu = new Array();
    var pocetReseni = 0;
    var promenna = 0;
    while (promenna >= 0 && pocetReseni < pozadovanychReseni) {
      seznamPromennych = this._dynamicOrder(promenna, seznamPromennych);
      var zpracovavanaPromenna = seznamPromennych[promenna];
      zpracovavanaPromenna.pozice++;
      if (zpracovavanaPromenna.pozice > zpracovavanaPromenna.domena.length - 1) {
        zpracovavanaPromenna.pozice = -1;
        promenna--;
        continue;
      }

      var krokAlgoritmu = new KrokAlgoritmu();
      krokAlgoritmu.popis = 'Výběr hodnoty z domény proměnné ' + zpracovavanaPromenna.nazev;
      krokAlgoritmu.nazev = zpracovavanaPromenna.nazev;
      krokAlgoritmu.promenna = promenna;
      krokAlgoritmu.hodnota = zpracovavanaPromenna.domena[zpracovavanaPromenna.pozice];
      krokAlgoritmu.rodic = this._lastIndex(promenna - 1, postupTvoreniGrafu) + 1;
      postupTvoreniGrafu.push(krokAlgoritmu);

      var splneniOmezeni = this._porovnej(zpracovavanaPromenna, seznamPromennych);
      if (splneniOmezeni.length > 0) {
        krokAlgoritmu.popis += splneniOmezeni;
        krokAlgoritmu.stav = 'deadend';
      } else {
        if (promenna === (seznamPromennych.length - 1)) {
          pocetReseni++;
          krokAlgoritmu.stav = 'reseni';
          krokAlgoritmu.popis = 'NALEZENO ŘEŠENÍ';
        } else {
          promenna++;
        }
      }

    }
    return postupTvoreniGrafu;
  }

  iConsistency(pocetReseni, iPocet, seznamPromennych) {
    seznamPromennych = [];
    // seznamPromennych.push(new Promenna("A", [1, 2], []))
    // seznamPromennych.push(new Promenna("B", [3, 4], []))
    // seznamPromennych.push(new Promenna("C", [5, 6], []))
    // seznamPromennych.push(new Promenna("D", [7, 8], []))
    // seznamPromennych.push(new Promenna("E", [9, 0], [new Omezeni("=", ["A", "B", "D"], null)]))
    seznamPromennych.push(new Promenna('A', [1], []));
    seznamPromennych.push(new Promenna('B', [2], []));
    seznamPromennych.push(new Promenna('C', [3, 4], []));
    seznamPromennych.push(new Promenna('D', [4, 5], []));
    seznamPromennych.push(new Promenna('E', [4, 5], [new Omezeni('=', ['C', 'D'], null)]));
    iPocet = 3;

    this._prevodOmezeni(seznamPromennych);

    iPocet--;
    if (iPocet < 1) {
      //CHYBOVA HLASKA ZE CISLO MUSI BYT ASPON 1
    }
    //Zjisteni u kazde promenne, s jakymi promennymi musi splnovat omezeni
    var seznamVsechPromennychOmezeni = [];
    for (var i = 0; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      var seznamPromennychproOmezeni = [];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        var typOmezeni = promenna.omezeni[j].typOmezeni;
        if (typOmezeni == 'p' || typOmezeni == 'z') {
          if (seznamPromennychproOmezeni.indexOf(promenna.omezeni[j].omezeniProPromennou) == -1) {
            seznamPromennychproOmezeni.push(promenna.omezeni[j].omezeniProPromennou);
          }
        } else {
          for (var k = 0; k < promenna.omezeni[j].hodnotyOmezeni.length; k++) {
            if (seznamPromennychproOmezeni.indexOf(promenna.omezeni[j].hodnotyOmezeni[k]) == -1) {
              seznamPromennychproOmezeni.push(promenna.omezeni[j].hodnotyOmezeni[k]);
            }
          }
        }
      }
      seznamVsechPromennychOmezeni.push(seznamPromennychproOmezeni);
    }
    while (this._iConsistencyKontrola(iPocet, seznamPromennych, seznamVsechPromennychOmezeni)
    ) { }
    this.backtracking(pocetReseni, seznamPromennych);
  }

  _iConsistencyKontrola(iPocet, seznamPromennych, seznamVsechPromennychOmezeni) {
    var provedenaZmenaDomeny = false;
    for (var i = seznamPromennych.length - 1; i >= 0;) {
      var promennaZ = seznamPromennych[i];
      if (seznamVsechPromennychOmezeni[i].length < iPocet) {
        i--;
        continue;
      }
      if (++promennaZ.pozice >= promennaZ.domena.length) {
        i--;
        continue;
      }
      var z = promennaZ.domena[promennaZ.pozice];
      var pocetUspesnychPromennych = 0;
      for (var j = 0; j < i; j++) {
        seznamPromennych[j].pozice = -1;
      }
      for (var j = (i - 1); j >= 0; j--) {
        var promennaY = seznamPromennych[j];
        if (seznamVsechPromennychOmezeni[i].indexOf(promennaY.nazev) == -1) {
          continue;
        }
        if (++promennaY.pozice >= promennaY.domena.length) {
          continue;
        }
        var y = promennaY.domena[promennaY.pozice];
        if (this._iConsistencyKontrolaOmezeni(promennaZ, seznamPromennych, promennaY.nazev)) {
          pocetUspesnychPromennych++;
          if (pocetUspesnychPromennych == iPocet) {
            break;
          } else {
            continue;
          }
        }
        j++;
      }
      if (pocetUspesnychPromennych < iPocet) {
        promennaZ.domena.splice(promennaZ.pozice, 1);
        promennaZ.pozice--;
        provedenaZmenaDomeny = true;
      }
    }
    return provedenaZmenaDomeny;
  }

  _iConsistencyKontrolaOmezeni(promenna, seznamPromennych, iOmezeni) {
    var cislo = promenna.domena[promenna.pozice];
    for (var i = 0; i < promenna.omezeni.length; i++) {
      var omezeni = promenna.omezeni[i];

      switch (omezeni.typOmezeni) {
        case '<':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo < porovnavanaHodnota)) {
              return false;
            }
          }
          break;
        case '>':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo > porovnavanaHodnota)) {
              return false;
            }
          }
          break;
        case '=':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo !== porovnavanaHodnota) {
              return false;
            }
          }
          break;
        case '!':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            if (porovnavanaPromenna != iOmezeni) {
              continue;
            }
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo === porovnavanaHodnota) {
              return false;
            }
          }
          break;
        case 'p':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          if (porovnavanaPromenna != iOmezeni) {
            continue;
          }
          var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          var nalezeno = false;
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var a = parseInt(omezeni.hodnotyOmezeni[j][0]);
            var b = parseInt(omezeni.hodnotyOmezeni[j][1]);
            if (cislo === a && porovnavanaHodnota === b) {
              nalezeno = true;
              break;
            }
          }
          if (!nalezeno) {
            return false;
          }
          break;
        case 'z':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          if (porovnavanaPromenna != iOmezeni) {
            continue;
          }
          var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            if (cislo === parseInt(omezeni.hodnotyOmezeni[j][0]) && porovnavanaHodnota === parseInt(omezeni.hodnotyOmezeni[j][1])) {
              return false;
            }
          }
          break;
      }
    }
    return true;
  }

  testPrevoduOmezeni() {
    var seznamPromennych = [];
    seznamPromennych.push(new Promenna('A', [1, 2, 3, 4, 5], [new Omezeni('p', [[1, 2], [3, 4]], 'C')]));
    // seznamPromennych.push(new Promenna("A", [1,2,3,4, 5], [new Omezeni("=",["C","E"],null)]))
    seznamPromennych.push(new Promenna('B', [4, 3, 2], []));
    seznamPromennych.push(new Promenna('C', [3, 1], [new Omezeni('p', [[6, 5]], 'A')]));
    // seznamPromennych.push(new Promenna("C", [3,1], [new Omezeni("=",["B"],null)]))
    seznamPromennych.push(new Promenna('D', [4], []));
    seznamPromennych.push(new Promenna('E', [1, 5], []));

    this._prevodOmezeni(seznamPromennych);

  }

  _dynamicOrder(promenna, seznamPromennych) {
    var nejmensiDelkaDomeny = 999999999;
    var pozicePromenneSNejmensiDelkouDomeny = 999999999;
    for (var i = promenna; i < seznamPromennych.length; i++) {
      if (seznamPromennych[i].domena.length < nejmensiDelkaDomeny) {
        nejmensiDelkaDomeny = seznamPromennych[i].domena.length;
        pozicePromenneSNejmensiDelkouDomeny = i;
      }
    }
    var pom = seznamPromennych[pozicePromenneSNejmensiDelkouDomeny];
    seznamPromennych[pozicePromenneSNejmensiDelkouDomeny] = seznamPromennych[promenna];
    seznamPromennych[promenna] = pom;
    return seznamPromennych;
  }

  _lastIndex(promenna, postupTvoreniGrafu) {
    for (var i = postupTvoreniGrafu.length - 1; i >= 0; i--) {
      if (postupTvoreniGrafu[i].promenna === promenna) {
        return i;
      }
    }

    return -1;
  }

  _indexOfAll(array, symbol) {
    var indexy = [];
    var idx = array.indexOf(symbol);
    while (idx !== -1) {
      indexy.push(idx);
      idx = array.indexOf(symbol, idx + 1);
    }
    return indexy;
  }

  _prevodOmezeni(seznamPromennych) {
    var zmeneno = false;

    for (var i = 0; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        var omezeni = promenna.omezeni[j];
        switch (omezeni.typOmezeni) {
          case '<':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this._indexOf(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this._valueOf(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '>') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni = new Omezeni('<', [promenna.nazev], null);
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '>':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this._indexOf(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this._valueOf(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '<') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni = new Omezeni('>', [promenna.nazev], null);
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '=':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this._indexOf(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this._valueOf(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '=') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni = new Omezeni('=', [promenna.nazev], null);
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '!':
            for (var l = 0; l < omezeni.hodnotyOmezeni.length; l++) {
              var porovnavaneOmezeni = omezeni.hodnotyOmezeni[l];
              if (this._indexOf(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = this._valueOf(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '!') {
                    porovnavanaPromenna.omezeni[m].hodnotyOmezeni.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni = new Omezeni('!', [promenna.nazev], null);
                }
                zmeneno = false;
                omezeni.hodnotyOmezeni.splice(l, 1);
                l--;
              }
            }
            if (omezeni.hodnotyOmezeni.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case 'p':
            var pomocnaPromenna;
            if (this._indexOf(seznamPromennych, omezeni.omezeniProPromennou) > i) {
              var porovnavanaPromenna = this._valueOf(seznamPromennych, omezeni.omezeniProPromennou);
              var seznamDvojic = omezeni.hodnotyOmezeni;
              for (var k = 0; k < seznamDvojic.length; k++) {
                var dvojice = seznamDvojic[k];
                pomocnaPromenna = dvojice[0];
                dvojice[0] = dvojice[1];
                dvojice[1] = pomocnaPromenna;
              }
              var jesteNeexistujeOmezeni = true;
              for (var k = 0; k < porovnavanaPromenna.omezeni.length; k++) {
                if (porovnavanaPromenna.omezeni[k].omezeniProPromennou == promenna.nazev) {
                  jesteNeexistujeOmezeni = false;
                  for (var l = 0; l < seznamDvojic.length; l++) {
                    porovnavanaPromenna.omezeni[k].hodnotyOmezeni.push(seznamDvojic[l]);
                  }
                }
              }
              if (jesteNeexistujeOmezeni) {
                porovnavanaPromenna.omezeni.push(new Omezeni('p', seznamDvojic, promenna.nazev));
              }
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case 'z':
            var pomocnaPromenna;
            if (this._indexOf(seznamPromennych, omezeni.omezeniProPromennou) > i) {
              var porovnavanaPromenna = this._valueOf(seznamPromennych, omezeni.omezeniProPromennou);
              var seznamDvojic = omezeni.hodnotyOmezeni;
              for (var k = 0; k < seznamDvojic.length; k++) {
                var dvojice = seznamDvojic[k];
                pomocnaPromenna = dvojice[0];
                dvojice[0] = dvojice[1];
                dvojice[1] = pomocnaPromenna;
              }
              var jesteNeexistujeOmezeni = true;
              for (var k = 0; k < porovnavanaPromenna.omezeni.length; k++) {
                if (porovnavanaPromenna.omezeni[k].omezeniProPromennou == promenna.nazev) {
                  jesteNeexistujeOmezeni = false;
                  for (var l = 0; l < seznamDvojic.length; l++) {
                    porovnavanaPromenna.omezeni[k].hodnotyOmezeni.push(seznamDvojic[l]);
                  }
                }
              }
              if (jesteNeexistujeOmezeni) {
                porovnavanaPromenna.omezeni.push(new Omezeni('z', seznamDvojic, promenna.nazev));
              }
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
        }
      }
    }
    return seznamPromennych;
  }

  _porovnej(promenna, seznamPromennych) {
    if (!promenna.omezeni) {
      return '';
    }

    var cislo = promenna.domena[promenna.pozice];
    for (var i = 0; i < promenna.omezeni.length; i++) {
      var omezeni = promenna.omezeni[i];

      switch (omezeni.typOmezeni) {
        case '<':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo < porovnavanaHodnota)) {
              return ', nesplnění podmínky ' + promenna.nazev + '<' + porovnavanaPromenna + ' (' + cislo + '<' + porovnavanaHodnota + ')';
            }
          }
          break;
        case '>':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo > porovnavanaHodnota)) {
              return ', nesplnění podmínky ' + promenna.nazev + '>' + porovnavanaPromenna + ' (' + cislo + '>' + porovnavanaHodnota + ')';
            }
          }
          break;
        case '=':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo !== porovnavanaHodnota) {
              return ', nesplnění podmínky ' + promenna.nazev + '=' + porovnavanaPromenna + ' (' + cislo + '=' + porovnavanaHodnota + ')';
            }
          }
          break;
        case '!':
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var porovnavanaPromenna = omezeni.hodnotyOmezeni[j];
            var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo === porovnavanaHodnota) {
              return ', nesplnění podmínky ' + promenna.nazev + '≠' + porovnavanaPromenna + ' (' + cislo + '≠' + porovnavanaHodnota + ')';
            }
          }
          break;
        case 'p':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          var nalezeno = false;
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var a = parseInt(omezeni.hodnotyOmezeni[j][0]);
            var b = parseInt(omezeni.hodnotyOmezeni[j][1]);
            if (cislo === a && porovnavanaHodnota === b) {
              nalezeno = true;
              break;
            }
          }
          if (!nalezeno) {
            return ',  nesplnění podmínky ' + promenna.nazev + 'p' + porovnavanaPromenna + ' (' + cislo + 'p' + porovnavanaHodnota + ')';
          }
          break;
        case 'z':
          var porovnavanaPromenna = omezeni.omezeniProPromennou;
          var porovnavanaHodnota = this._valueOf(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            if (cislo === parseInt(omezeni.hodnotyOmezeni[j][0]) && porovnavanaHodnota === parseInt(omezeni.hodnotyOmezeni[j][1])) {
              return ',  nesplnění podmínky ' + promenna.nazev + 'z' + porovnavanaPromenna + ' (' + cislo + 'z' + porovnavanaHodnota + ')';
            }
          }
          break;
      }
    }
    return '';
  }



  _indexOf(seznamPromennych, nazev) {
    for (var i = 0; i < seznamPromennych.length; i++) {
      if (seznamPromennych[i].nazev === nazev) {
        return i;
      }
    }

    return -1;
  }

  _valueOf(seznamPromennych, nazev) {
    for (var i = 0; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      if (promenna.nazev === nazev) {
        return promenna;
      }
    }

    return null;
  }



  initGraph(){
    // var $ = go.GraphObject.make;
    // var myDiagram =
    //   $(go.Diagram, "myDiagramDiv",
    //     {
    //       initialContentAlignment: go.Spot.Center, // center Diagram contents
    //       "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
    //     });

    // var myModel = $(go.Model);
    // // in the model data, each node is represented by a JavaScript object:
    // myModel.nodeDataArray = [
    //   { key: "Alpha" },
    //   { key: "Beta" },
    //   { key: "Gamma" }
    // ];
    // myDiagram.model = myModel;



    var postup = new Array();
    postup=this.postup;
    var $ = go.GraphObject.make;
    var myDiagram =
            $(go.Diagram, 'myDiagramDiv',
                    {
                        'toolManager.hoverDelay': 100,
                        'undoManager.isEnabled': true,
                        initialContentAlignment: go.Spot.Top,
                        allowCopy: false,
                        layout:
                                $(go.TreeLayout,
                                        {angle: 90, nodeSpacing: 10, layerSpacing: 40, layerStyle: go.TreeLayout.LayerUniform})
                    });
    this.graf = myDiagram;
    var reseni = '#72E91B';
    var deadEnd = '#FFB40E';

    function endColor(end) {
        if (end === 'reseni') {
            return reseni;
        }
        if (end === 'deadend') {
            return deadEnd;
        }
        if (end === 'nic') {
            return 'gray';
        }
    }

    function tooltipTextConverter(prvek) {
        var str = prvek.title;

        return str;
    }

    var tooltiptemplate =
            $(go.Adornment, 'Auto',
                    $(go.Shape, 'Rectangle',
                            {fill: 'whitesmoke', stroke: 'black'}),
                    $(go.TextBlock,
                            {font: 'bold 8pt Helvetica, bold Arial, sans-serif',
                                wrap: go.TextBlock.WrapFit,
                                margin: 5},
                            new go.Binding('text', '', tooltipTextConverter))
                    );

    myDiagram.nodeTemplate =
            $(go.Node, 'Auto',
                    {deletable: false, toolTip: tooltiptemplate},
                    new go.Binding('text', 'name'),
                    $(go.Shape, 'Rectangle',
                            {fill: 'lightgray',
                                stroke: 'full', strokeWidth: 1,
                                alignment: go.Spot.Center},
                            new go.Binding('fill', 'end', endColor)),
                    $(go.TextBlock,
                            {font: '700 15px Droid Serif, sans-serif',
                                textAlign: 'center',
                                margin: 8, maxSize: new go.Size(80, NaN)},
                            new go.Binding('text', 'name'))
                    );
    myDiagram.linkTemplate =
            $(go.Link,
                    {routing: go.Link.Orthogonal, corner: 5, selectable: false},
                    $(go.Shape, {strokeWidth: 3, stroke: '#424242'}));

    this.reloadGraph();

    const self = this;
    document.getElementById('zoomToFit').addEventListener('click', function () {
        myDiagram.zoomToFit();
    });
    document.getElementById('centerRoot').addEventListener('click', function () {
        myDiagram.scale = myDiagram.scale * 1.1;
        myDiagram.scrollToRect(myDiagram.findNodeForKey(0).actualBounds);
    });

    const nextFunction = function () {
      const modelManager = self.graf.model.undoManager; 
      if (modelManager.canRedo()) {
        modelManager.redo();
        return;
      }
      
      const krok = modelManager.historyIndex + 1;
        if (krok === self.postup.length) {
            return;
        }

        const node = self.postup[krok];
      
        myDiagram.startTransaction('make new node');
        myDiagram.model.addNodeData({key: (krok + 1), parent: node.rodic, name: node.hodnota, end: node.stav, title: node.nazev});
        for (var i = 0; i < node.hodnotaDomenKroku.length; i++) {
            document.getElementById('domena' + i).nodeValue = node.hodnotaDomenKroku[i];
        }
        document.getElementById('krok').innerHTML = node.popis;
        myDiagram.commitTransaction('make new node');
    };
    
    document.getElementById('next').addEventListener('click', nextFunction);
    document.getElementById('next10').addEventListener('click', function () {
        for (var i = 0; i < 10; i++) {
            nextFunction();
        }
    });
    
    var prevFunction = function () {
      const modelManager = self.graf.model.undoManager; 
      if (modelManager.canUndo()) {
        modelManager.undo();
        return;
      }
    };

    document.getElementById('previous').addEventListener('click', prevFunction);
    document.getElementById('previous10').addEventListener('click', function () {
        for (var i = 0; i < 10; i++) {
            prevFunction();
        }
    });

    document.getElementById('whole').addEventListener('click', function () {
      const modelManager = self.graf.model.undoManager;
      while (modelManager.historyIndex + 1 < self.postup.length) {
        nextFunction();
      }
    });
  }

  reloadGraph() {
    const nodeDataArray = [{key: 0, name: 'root'}];
    this.graf.model = new go.TreeModel(nodeDataArray);
  }
  
  // TODO directive
  convertFromString(value: string) {
    const result =  value.split(',').map(function(item, index, array) {
      const converted = parseInt(item.trim(), 10);
      if (!isNaN(converted)) {
        return converted;
      }
      
      if (index === array.length - 1 && item === '-') {
        return item;
      }
      
      return null;
    }).filter(function(item, index, array) {
      return item || (index === array.length - 1);
    });
    
    return result;
  }
}
