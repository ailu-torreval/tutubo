import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, HostListener, Inject, Input, Renderer2 } from '@angular/core';
import { DomController, isPlatform } from '@ionic/angular';

enum Direction {
  downup = 1,
  down = 0,
}

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements AfterViewInit {
  @Input('appHideHeader') header: any;
  previousY = 0;
  direction: Direction = Direction.down;
  saveY = 0;
  scrollDistance = isPlatform('ios') ? 88 : 112;
  content: any;


  constructor(private renderer: Renderer2,
    private domCtrl: DomController,
    private elRef: ElementRef,
    @Inject(DOCUMENT) private document: Document) { }

    
    @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
      console.log($event);

      //bcs on iphone you can scroll negative, we have to skip it
      if ($event.detail.currentY <= 0 || $event.detail.currentY == this.saveY) {
        return
      }
      //we set scroll top ditance and set the scroll direction to down for now
      const scrollTop: number = $event.detail.scrollTop;
      let newDirection = Direction.down;
      
      // calculate the distance from top based on the previousY, which is set whe we change directions
      let newPosition = -scrollTop + this.previousY;

      //we are scrolling downup the page in this case, we need to reduce the position first to prevent it to jump from -50 to 0
      if (this.saveY > $event.detail.currentY) {
        newDirection = Direction.downup;
        newPosition -= this.scrollDistance;
      }

      // make max scroll distance the en of the range

      if(newPosition < -this.scrollDistance) {
        newPosition = -this.scrollDistance;
      }
      const contentPosition = this.scrollDistance + newPosition;

      this.domCtrl.write(()=> {
        this.renderer.setStyle(
          this.header,
          'top',
          Math.min(0, newPosition) + 'px'
        );

        this.renderer.setStyle(
          this.content,
          'top',
          Math.min(this.scrollDistance, contentPosition) + 'px'
        );
      });



      // store the current Y value to see in which direction we scroll
      this.saveY = $event.detail.currentY;

      //if the directionchanged, store the point of change for calculations
      if(newDirection !== this.direction) {
        this.direction = newDirection;
        this.previousY = scrollTop;
      }


    }
    ngAfterViewInit() {
      this.header = this.header.el;
      this.content = this.elRef.nativeElement;

      this.renderer.setStyle(this.content, 'position', `absolute`);
      this.renderer.setStyle(this.content, 'top', `${this.scrollDistance}px`);

      //add the safe area top to copmlete fade out of the header (iphone nodge)
      const safeArea = getComputedStyle(
        this.document.documentElement
      ).getPropertyValue('--ion-safe-area-top');

      const safeAreaValue = +safeArea.split('px')[0];
      this.scrollDistance = this.scrollDistance + safeAreaValue;
       
    }

}
