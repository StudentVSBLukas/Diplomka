import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-algoritm',
  templateUrl: './algoritm.component.html',
  styleUrls: ['./algoritm.component.css']
})


export class AlgoritmComponent implements OnInit {

  @Input() pocetPromennych;
  first = "green";
  display = 'none';
  neco=true;

  constructor() { }

  ngOnInit() {

  }

  openModal() {
    this.display = 'block';
  }
}
