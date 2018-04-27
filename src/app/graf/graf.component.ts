import { KrokAlgoritmu, LokalizovanaZprava, TypKroku } from '../data-model';
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

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.initGraph()
  }
  
  ngOnChanges(zmeny: SimpleChanges) {
    const novyPostup = zmeny['postup'];
    if (novyPostup) {
      this.reloadGraph();
    }
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
    function colorConverter(krok) {
        const stav = krok.stav;

        if (stav === 'reseni') {
            return '#72E91B';
        }
        if (stav === 'deadend') {
            return '#FFB40E';
        }
        if (stav === 'nic') {
            return 'gray';
        }

      return 'lightgray';
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
                            new go.Binding('fill', 'krok', colorConverter)),
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

    // TODO tento prvni krok si nechat definovat algoritmem
    this.aktualniKrok = new KrokAlgoritmu();
    this.aktualniKrok.hodnota = 'Start'; 
    // TODO this.aktualniKrok.hodnota = this.translate.instant(this.vybranyAlgoritmus.nazev);
    this.aktualniKrok.popis.push(new LokalizovanaZprava('popis.start'));
    const nodeDataArray = [{key: 0, krok: this.aktualniKrok}];
    this.graf.model = new go.TreeModel(nodeDataArray);
  }

  krokuj() {
      const modelManager = this.graf.model.undoManager;
      const krok = modelManager.historyIndex + 1;
      if (krok === this.postup.length) {
          return false;
      }

      this.aktualniKrok = this.postup[krok];
      if (modelManager.canRedo()) {
        modelManager.redo();
        return true;
      }

      this.graf.model.startTransaction('make new node');
      if (this.aktualniKrok.typ === TypKroku.akce) {
        // Akce prida novy uzel
        this.graf.model.addNodeData({key: (krok + 1), parent: this.aktualniKrok.rodic, krok: this.aktualniKrok});
      } else {
        // Jiny typ kroku zmeni popis, domenu, pole
        // Musime provest zmenu na diagramu, aby ji zaznamenal undoManager
        const root = this.graf.model.findNodeDataForKey(0);
        this.graf.model.setDataProperty(root, 'aktualniKrok', krok);
      }
      this.graf.model.commitTransaction('make new node');

    return true;
  }

  krokujReseni() {
    while (this.krokuj()) {
      const krok = this.postup[this.graf.model.undoManager.historyIndex];
      if (krok.stav === 'reseni') {
        break;
      }
    }
  }

  krokujCele() {
    while (this.krokuj()) {};
  }

  odkrokuj() {
      const modelManager = this.graf.model.undoManager;
      const krok = modelManager.historyIndex;
      if (krok >= 0) {
          this.aktualniKrok = this.postup[krok];
      } else {
          this.aktualniKrok = this.graf.model.findNodeDataForKey(0).krok;
      }

      if (modelManager.canUndo()) {
        modelManager.undo();
        return true;
      }

    return false;
  }

  odkrokujReseni() {
    while (this.odkrokuj()) {
      const krok = this.graf.model.undoManager.historyIndex;
      if (krok >= 0 && this.postup[krok].stav === 'reseni') {
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

}
