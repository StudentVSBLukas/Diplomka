import {Promenna, LokalizovanaZprava, Omezeni, KrokAlgoritmu} from '../data-model';

export default class AlgoritmusUtils {

  static najdi(seznamPromennych: Array<Promenna>, nazev: string) {
    for (let i = 0; i < seznamPromennych.length; i++) {
      const promenna = seznamPromennych[i];
      if (promenna.nazev === nazev) {
        return promenna;
      }
    }

    return null;
  }

  static index(seznamPromennych: Array<Promenna>, nazev: string): number {
    for (let i = 0; i < seznamPromennych.length; i++) {
      if (seznamPromennych[i].nazev === nazev) {
        return i;
      }
    }

    return -1;
  }
  
  static prevedOmezeni(seznamPromennych: Array<Promenna>) {
    var zmeneno = false;

    for (var i = 0; i < seznamPromennych.length; i++) {
      var promenna = seznamPromennych[i];
      for (var j = 0; j < promenna.omezeni.length; j++) {
        var omezeni = promenna.omezeni[j];
        switch (omezeni.typOmezeni) {
          case '<':
            for (var l = 0; l < omezeni.omezeniProPromennou.length; l++) {
              var porovnavaneOmezeni = omezeni.omezeniProPromennou[l];
              if (AlgoritmusUtils.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '>') {
                    porovnavanaPromenna.omezeni[m].omezeniProPromennou.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('>', [promenna.nazev]));
                }
                zmeneno = false;
                omezeni.omezeniProPromennou.splice(l, 1);
                l--;
              }
            }
            if (omezeni.omezeniProPromennou.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '>':
            for (var l = 0; l < omezeni.omezeniProPromennou.length; l++) {
              var porovnavaneOmezeni = omezeni.omezeniProPromennou[l];
              if (AlgoritmusUtils.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '<') {
                    porovnavanaPromenna.omezeni[m].omezeniProPromennou.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('<', [promenna.nazev]));
                }
                zmeneno = false;
                omezeni.omezeniProPromennou.splice(l, 1);
                l--;
              }
            }
            if (omezeni.omezeniProPromennou.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '=':
            for (var l = 0; l < omezeni.omezeniProPromennou.length; l++) {
              var porovnavaneOmezeni = omezeni.omezeniProPromennou[l];
              if (AlgoritmusUtils.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '=') {
                    porovnavanaPromenna.omezeni[m].omezeniProPromennou.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('=', [promenna.nazev]));
                }
                zmeneno = false;
                omezeni.omezeniProPromennou.splice(l, 1);
                l--;
              }
            }
            if (omezeni.omezeniProPromennou.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case '!':
            for (var l = 0; l < omezeni.omezeniProPromennou.length; l++) {
              var porovnavaneOmezeni = omezeni.omezeniProPromennou[l];
              if (AlgoritmusUtils.index(seznamPromennych, porovnavaneOmezeni) > i) {
                var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, porovnavaneOmezeni);
                for (var m = 0; m < porovnavanaPromenna.omezeni.length; m++) {
                  if (porovnavanaPromenna.omezeni[m].typOmezeni === '!') {
                    porovnavanaPromenna.omezeni[m].omezeniProPromennou.push(promenna.nazev);
                    zmeneno = true;
                  }
                }
                if (!zmeneno) {
                  porovnavanaPromenna.omezeni.push(new Omezeni('!', [promenna.nazev]));
                }
                zmeneno = false;
                omezeni.omezeniProPromennou.splice(l, 1);
                l--;
              }
            }
            if (omezeni.omezeniProPromennou.length === 0) {
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case 'p':
            var pomocnaPromenna;
            var omezeniProPromennou = omezeni.omezeniProPromennou[0];
            if (AlgoritmusUtils.index(seznamPromennych, omezeniProPromennou) > i) {
              var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, omezeniProPromennou);
              var seznamDvojic = omezeni.hodnotyOmezeni;
              for (var k = 0; k < seznamDvojic.length; k++) {
                var dvojice = seznamDvojic[k];
                pomocnaPromenna = dvojice[0];
                dvojice[0] = dvojice[1];
                dvojice[1] = pomocnaPromenna;
              }
              var jesteNeexistujeOmezeni = true;
              for (var k = 0; k < porovnavanaPromenna.omezeni.length; k++) {
                var existujiciOmezeni = porovnavanaPromenna.omezeni[k];
                if (existujiciOmezeni.typOmezeni === 'p' && existujiciOmezeni.omezeniProPromennou[0] === promenna.nazev) {
                  jesteNeexistujeOmezeni = false;
                  for (var l = 0; l < seznamDvojic.length; l++) {
                    existujiciOmezeni.hodnotyOmezeni.push(seznamDvojic[l]);
                  }
                }
              }
              if (jesteNeexistujeOmezeni) {
                porovnavanaPromenna.omezeni.push(new Omezeni('p', [promenna.nazev], seznamDvojic));
              }
              promenna.omezeni.splice(j, 1);
              j--;
            }
            break;
          case 'z':
            var pomocnaPromenna;
            var omezeniProPromennou = omezeni.omezeniProPromennou[0];
            if (AlgoritmusUtils.index(seznamPromennych, omezeniProPromennou) > i) {
              var porovnavanaPromenna = AlgoritmusUtils.najdi(seznamPromennych, omezeniProPromennou);
              var seznamDvojic = omezeni.hodnotyOmezeni;
              for (var k = 0; k < seznamDvojic.length; k++) {
                var dvojice = seznamDvojic[k];
                pomocnaPromenna = dvojice[0];
                dvojice[0] = dvojice[1];
                dvojice[1] = pomocnaPromenna;
              }
              var jesteNeexistujeOmezeni = true;
              for (var k = 0; k < porovnavanaPromenna.omezeni.length; k++) {
                var existujiciOmezeni = porovnavanaPromenna.omezeni[k];
                if (existujiciOmezeni.typOmezeni === 'z' && existujiciOmezeni.omezeniProPromennou[0] === promenna.nazev) {
                  jesteNeexistujeOmezeni = false;
                  for (var l = 0; l < seznamDvojic.length; l++) {
                    existujiciOmezeni.hodnotyOmezeni.push(seznamDvojic[l]);
                  }
                }
              }
              if (jesteNeexistujeOmezeni) {
                porovnavanaPromenna.omezeni.push(new Omezeni('z', [promenna.nazev], seznamDvojic));
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

  static porovnej(promenna: Promenna, seznamPromennych: Array<Promenna>) {
    if (!promenna.omezeni) {
      return null;
    }

    const popisPrubehuOmezeni = new Array<LokalizovanaZprava>();

    var cislo = promenna.domena[promenna.pozice];
    for (var i = 0; i < promenna.omezeni.length; i++) {
      var omezeni = promenna.omezeni[i];

      switch (omezeni.typOmezeni) {
        case '<':
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo < porovnavanaHodnota)) {
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case '>':
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (!(cislo > porovnavanaHodnota)) {
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case '=':
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo !== porovnavanaHodnota) {
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case '!':
          for (var j = 0; j < omezeni.omezeniProPromennou.length; j++) {
            var porovnavanaPromenna = omezeni.omezeniProPromennou[j];
            var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
            if (cislo === porovnavanaHodnota) {
              var popis = new LokalizovanaZprava();
              popis.klic = 'popis.omezeni.nesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.splneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota, 'typOmezeni': omezeni.typOmezeni }
            popisPrubehuOmezeni.push(popis);
          }
          break;
        case 'p':
          var porovnavanaPromenna = omezeni.omezeniProPromennou[0];
          var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          var nalezeno = false;
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            var a = omezeni.hodnotyOmezeni[j][0];
            var b = omezeni.hodnotyOmezeni[j][1];
            if (cislo === a && porovnavanaHodnota === b) {
              nalezeno = true;
              break;
            }
          }
          if (!nalezeno) {
            var popis = new LokalizovanaZprava();
            popis.klic = 'popis.omezeni.povolenoNesplneno';
            popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
            popisPrubehuOmezeni.push(popis);
            return popisPrubehuOmezeni;
          }
          var popis = new LokalizovanaZprava();
          popis.klic = 'popis.omezeni.povolenoSplneno';
          popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
          popisPrubehuOmezeni.push(popis);
          break;
        case 'z':
          var porovnavanaPromenna = omezeni.omezeniProPromennou[0];
          var porovnavanaHodnota = AlgoritmusUtils.najdi(seznamPromennych, porovnavanaPromenna).vratPrirazenouHodnotu();
          for (var j = 0; j < omezeni.hodnotyOmezeni.length; j++) {
            if (cislo === omezeni.hodnotyOmezeni[j][0] && porovnavanaHodnota === omezeni.hodnotyOmezeni[j][1]) {
              popis.klic = 'popis.omezeni.zakazaneNesplneno';
              popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
              popisPrubehuOmezeni.push(popis);
              return popisPrubehuOmezeni;
            }
          }
          var popis = new LokalizovanaZprava();
          popis.klic = 'popis.omezeni.zakazeneSplneno';
          popis.parametry = { 'nazev': promenna.nazev, 'porovnavanaPromenna': porovnavanaPromenna, 'hondnota': cislo, 'porovnavanaHodnota': porovnavanaHodnota }
          popisPrubehuOmezeni.push(popis);
          break;
      }
    }
  }

  static najdiRodice(promenna: Promenna, postupTvoreniGrafu: Array<KrokAlgoritmu>) {
    if (!promenna) {
      return 0;
    }
    for (let i = postupTvoreniGrafu.length - 1; i >= 0; i--) {
      if (postupTvoreniGrafu[i].nazev === promenna.nazev) {
        return i;
      }
    }

    return 0;
  }
}
