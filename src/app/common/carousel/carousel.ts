import { Component, computed, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {NgStyle} from '@angular/common'
import { type Slide } from 'types/types';
@Component({
  selector: 'carousel-component',
  imports: [NgStyle, MatIcon],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss'
})
export class Carousel {
  parentWidth = input.required<number>();
  slides = input.required<Slide[]>();
  currentIndex = signal(0)
  sliderContainerWidth = computed(() => ({
    width: `${((this.parentWidth() / 100) * 70)*this.slides().length}px`,
    transform: `translateX(-${((this.parentWidth() / 100) * 70) * this.currentIndex()}px)`
  }))

  getSlideStyle = () => {
  return {
    width: `${(this.parentWidth() / 100) * 70}px`
  }}

  previous() {
    this.currentIndex() === 0 ? this.currentIndex.set(this.slides().length - 1) : this.currentIndex.set(this.currentIndex() - 1)
  }

  next() {
    this.currentIndex() === this.slides().length - 1 ? this.currentIndex.set(0) : this.currentIndex.set(this.currentIndex() + 1)
  }

  goToSlide(index: number) {
    this.currentIndex.set(index)
  }
}
