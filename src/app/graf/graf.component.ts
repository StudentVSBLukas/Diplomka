import { KrokAlgoritmu, LokalizovanaZprava, TypKroku, StavKroku } from '../data-model';
import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as go from 'gojs';

@Component({
  selector: 'app-graf',
  templateUrl: './graf.component.html',
  styleUrls: ['./graf.component.css']
})
export class GrafComponent implements OnInit, OnChanges {

  @Input() postup: Array<KrokAlgoritmu>;

  graf: any;
  aktualniKrok: KrokAlgoritmu;

  zobrazDomenu = false;
  zobrazDetailDomeny = true;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.initGraph()
  }

  ngOnChanges(zmeny: SimpleChanges) {
    // Zmena postupu
    if (zmeny['postup']) {
      this.zobrazDomenu = false;
      for (let i = 0; i < this.postup.length; i++) {
        const domena = this.postup[i].hodnotaDomenKroku;
        if (domena && domena.length) {
          this.zobrazDomenu = true;
          break;
        }
      }

      this.reloadGraph();
    }
  }

  toggleDetailDomeny() {
    this.zobrazDetailDomeny = !this.zobrazDetailDomeny;
  }


  initGraph() {
    const $ = go.GraphObject.make;
    this.graf =
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

    const self = this;
    function valueConverter(krok) {
      return krok.nazev ? krok.nazev + ' = ' + krok.hodnota : krok.hodnota;
    }

    function tooltipConverter(krok: KrokAlgoritmu) {
        return krok.popis.map(
          (zprava: LokalizovanaZprava) => self.translate.instant(zprava.klic, zprava.parametry)
        ).join(' ');
    }

    const tooltipTemplate =
            $(go.Adornment, 'Auto',
                    $(go.Shape, 'Rectangle',
                            {fill: 'whitesmoke', stroke: 'black'}),
                    $(go.TextBlock,
                            {font: 'bold 8pt Helvetica, bold Arial, sans-serif',
                                wrap: go.TextBlock.WrapFit,
                                margin: 5},
                            new go.Binding('text', 'krok', tooltipConverter))
                    );

    this.graf.nodeTemplate =
            $(go.Node, 'Auto',
                    {deletable: false, toolTip: tooltipTemplate},
                    new go.Binding('text', 'name'),
                    $(go.Shape, 'Rectangle',
                            {fill: 'lightgray',
                                stroke: 'full', strokeWidth: 1,
                                alignment: go.Spot.Center},
                            new go.Binding('fill', 'krok', self.najdiBarvu)),
                    $(go.TextBlock,
                            {font: '700 15px Droid Serif, sans-serif',
                                textAlign: 'center',
                                margin: 8, maxSize: new go.Size(150, NaN)},
                            new go.Binding('text', 'krok', valueConverter))
                    );
    this.graf.linkTemplate =
            $(go.Link,
                    {routing: go.Link.Orthogonal, corner: 5, selectable: false},
                    $(go.Shape, {strokeWidth: 3, stroke: '#424242'}));

    this.reloadGraph();
  }

  reloadGraph() {
    if (!this.postup) {
      return;
    }
    if (!this.graf) {
      return;
    }

    this.graf.model = new go.TreeModel();
    this.krokuj();
    this.updateTransaction();
  }

  krokuj() {
      const model = this.graf.model;
      const modelManager = model.undoManager;
      const krok = modelManager.historyIndex + 1;
      if (krok === this.postup.length) {
          return false;
      }

      this.aktualniKrok = this.postup[krok];
      if (modelManager.canRedo()) {
        modelManager.redo();
        return true;
      }

      if (this.aktualniKrok.typ === TypKroku.akce) {
        // Akce prida novy uzel
        model.startTransaction('make new node');
        model.addNodeData({key: krok, parent: this.aktualniKrok.rodic, krok: this.aktualniKrok});
        model.commitTransaction('make new node');
      } else {
        this.updateTransaction();
      }

      return true;
  }

  krokujReseni() {
    while (this.krokuj()) {
      if (this.aktualniKrok.stav === StavKroku.reseni) {
        break;
      }
    }
  }

  krokujAkci() {
    while (this.krokuj()) {
      if (this.aktualniKrok.typ === TypKroku.akce) {
        break;
      }
    }
  }

  krokujCele() {
    while (this.krokuj()) {};
  }

  odkrokuj() {
      const modelManager = this.graf.model.undoManager;
      const krok = modelManager.historyIndex - 1;
      if (krok < 0) {
        return false;
      }

      this.aktualniKrok = this.postup[krok];
      modelManager.undo();

      return true;
  }

  odkrokujAkci() {
    while (this.odkrokuj()) {
      if (this.aktualniKrok.typ === TypKroku.akce) {
        break;
      }
    }
  }

  odkrokujReseni() {
    while (this.odkrokuj()) {
      if (this.aktualniKrok.stav === StavKroku.reseni) {
        break;
      }
    }
  }

  odkrokujCele() {
    while (this.odkrokuj()) {};
  }

  zoomIn() {
    this.graf.scale = this.graf.scale * 1.1;
    this.graf.scrollToRect(this.graf.findNodeForKey(0).actualBounds);
  }

  zoomOut() {
    this.graf.scale = this.graf.scale / 1.1;
    this.graf.scrollToRect(this.graf.findNodeForKey(0).actualBounds);
  }


  center() {
    this.graf.zoomToFit();
  }

  private updateTransaction() {
    const model = this.graf.model;

    model.startTransaction('Fake transaction');
    // Uprava stavu uzlu
    if (this.aktualniKrok.stav !== StavKroku.uzel) {
      const akce = this.najdiAkci(this.aktualniKrok);
      const uzel = this.graf.findNodeForKey(this.postup.indexOf(akce));
      uzel.elements.first().fill = this.najdiBarvu(this.aktualniKrok);
    }
    // Zmena pro undoManager
    const root = model.findNodeDataForKey(0);
    model.setDataProperty(root, 'aktualniKrok', this.graf.model.undoManager.historyIndex);
    model.commitTransaction('FakeTransaction');
  }

  private najdiAkci(krok: KrokAlgoritmu) {
    for (let i = this.postup.indexOf(krok); i >= 0; i--) {
      const akce = this.postup[i];
      if (akce.typ === TypKroku.akce) {
        return akce;
      }
    }

    return this.postup[0];
  }

  private najdiBarvu(krok: KrokAlgoritmu) {
      const stav = krok.stav;

      if (stav === StavKroku.reseni) {
          return '#72E91B';
      }
      if (stav === StavKroku.deadend) {
          return '#FFB40E';
      }
      if (stav === StavKroku.uzel) {
          return 'gray';
      }

      return 'lightgray';
  }
}

