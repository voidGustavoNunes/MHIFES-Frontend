import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ScrollTopModule } from 'primeng/scrolltop';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [
    ScrollTopModule
  ],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class ForbiddenComponent implements OnInit {

  mouseX: number = 0;
  mouseY: number = 0;
  screenWidth: number = 0;
  screenHeight: number = 0;
  seenMouse: boolean = false;

  // private jail: HTMLElement | null = null;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    // this.jail = this.elementRef.nativeElement.querySelector('#jail'); // Get jail element reference

    // document.addEventListener('mousemove', this.mouseUpdate, false);
    // document.addEventListener('mouseenter', this.mouseUpdate, false);
    // document.addEventListener('mouseleave', this.mouseLeft, false);
  }

  @HostListener('document:mousemove', ['$event'])
  mouseUpdate(event: MouseEvent) {
    if (!this.jail) return; // Handle potential null case

    const jailCoords = this.jail.getBoundingClientRect();
    const pageCoords = document.body.getBoundingClientRect();

    this.mouseX = event.pageX - jailCoords.left;
    this.mouseY = event.pageY - jailCoords.top;
    this.screenWidth = pageCoords.width;
    this.screenHeight = pageCoords.height;

    if (!this.seenMouse) {
      this.seenMouse = true;
      document.body.classList.add('seenMouse');
    }
  }

  mouseLeft(event: MouseEvent) {
    this.seenMouse = false;
    document.body.classList.remove('seenMouse');
  }

  private jail: HTMLElement | null = null;
}
