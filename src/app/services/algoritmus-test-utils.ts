import { Promenna, KrokAlgoritmu, Omezeni, TypOmezeni, StavKroku, TypKroku } from '../data-model';


export class AlgoritmusTestUtils {
  backtrackingExample: Promenna[];
  randomExample: Promenna[];
  backjumpingExample: Promenna[];
  dynamicOrderExample: Promenna[];
  forwardCheckingExample: Promenna[];
  forwardDvoExample: Promenna[];
  arcConsistencyExample: Promenna[];
  iConsistencyExample: Promenna[];

  constructor() {
    this.backtrackingExample = [];
    this.backtrackingExample.push(new Promenna('A', [1, 2, 3], [new Omezeni(TypOmezeni.nerovno, ['B', 'C', 'D', 'G'])]));
    this.backtrackingExample.push(new Promenna('B', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F'])]));
    this.backtrackingExample.push(new Promenna('C', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['G'])]));
    this.backtrackingExample.push(new Promenna('D', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['E', 'G'])]));
    this.backtrackingExample.push(new Promenna('E', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F', 'G'])]));
    this.backtrackingExample.push(new Promenna('F', [1, 3, 4]));
    this.backtrackingExample.push(new Promenna('G', [1, 2]));

    this.randomExample = [];
    this.randomExample.push(new Promenna('A', [1, 2]));
    this.randomExample.push(new Promenna('B', [4, 5], [new Omezeni(TypOmezeni.rovno, ['A'])]));
    this.randomExample.push(new Promenna('C', [1, 2, 3, 4, 5]));
    this.randomExample.push(new Promenna('D', [1, 2, 3, 4, 5]));
    this.randomExample.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni(TypOmezeni.vetsi, ['A'])]));

    this.backjumpingExample = [];
    this.backjumpingExample.push(new Promenna('A', [1, 2, 4], ));
    this.backjumpingExample.push(new Promenna('B', [1, 3, 5], ));
    this.backjumpingExample.push(new Promenna('C', [1, 2, 5], [new Omezeni(TypOmezeni.rovno, ['A'])]));
    this.backjumpingExample.push(new Promenna('D', [1, 3, 5], ));
    this.backjumpingExample.push(new Promenna('E', [2, 4, 5], [new Omezeni(TypOmezeni.rovno, ['C'])]));

    this.dynamicOrderExample = [];
    this.dynamicOrderExample.push(new Promenna('A', [1, 2, 3, 4, 5]));
    this.dynamicOrderExample.push(new Promenna('B', [4, 3, 2]));
    this.dynamicOrderExample.push(new Promenna('C', [3, 1]));
    this.dynamicOrderExample.push(new Promenna('D', [4]));
    this.dynamicOrderExample.push(new Promenna('E', [1, 5]));

    this.forwardCheckingExample = [];
    this.forwardCheckingExample.push(new Promenna('A', [1, 2, 3], [new Omezeni(TypOmezeni.nerovno, ['B', 'C', 'D', 'G'])]));
    this.forwardCheckingExample.push(new Promenna('B', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F'])]));
    this.forwardCheckingExample.push(new Promenna('C', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['G'])]));
    this.forwardCheckingExample.push(new Promenna('D', [1, 2], [new Omezeni(TypOmezeni.nerovno, ['E', 'G'])]));
    this.forwardCheckingExample.push(new Promenna('E', [2, 3], [new Omezeni(TypOmezeni.nerovno, ['F', 'G'])]));
    this.forwardCheckingExample.push(new Promenna('F', [1, 3, 4]));
    this.forwardCheckingExample.push(new Promenna('G', [1, 2]));

    this.forwardDvoExample = [];
    this.forwardDvoExample.push(new Promenna('A', [5, 4]));
    this.forwardDvoExample.push(new Promenna('B', [2]));
    this.forwardDvoExample.push(new Promenna('C', [3]));
    this.forwardDvoExample.push(new Promenna('D', [4]));
    this.forwardDvoExample.push(new Promenna('E', [1, 2, 3, 4, 5], [new Omezeni(TypOmezeni.rovno, ['A', 'D'])]));

    this.arcConsistencyExample = [];
    this.arcConsistencyExample.push(new Promenna('A', [5]));
    this.arcConsistencyExample.push(new Promenna('B', [2]));
    this.arcConsistencyExample.push(new Promenna('C', [3]));
    this.arcConsistencyExample.push(new Promenna('D', [4]));
    this.arcConsistencyExample.push(new Promenna('E', [4, 5],
      [new Omezeni(TypOmezeni.zakazano, ['A'], [[5, 5]]), new Omezeni(TypOmezeni.zakazano, ['D'], [[4, 4]])]));

    this.iConsistencyExample = [];
    this.iConsistencyExample.push(new Promenna('A', [1]));
    this.iConsistencyExample.push(new Promenna('B', [2]));
    this.iConsistencyExample.push(new Promenna('C', [3, 4]));
    this.iConsistencyExample.push(new Promenna('D', [4, 5]));
    this.iConsistencyExample.push(new Promenna('E', [4, 5], [new Omezeni(TypOmezeni.rovno, ['C', 'D'])]));
  }

  pocetReseni(postup: KrokAlgoritmu[]): number {
    return postup.filter(krok => krok.stav === StavKroku.reseni).length;
  }

  pocetUzlu(postup: KrokAlgoritmu[]): number {
    return postup.filter(krok => krok.typ === TypKroku.akce).length;
  }
}
