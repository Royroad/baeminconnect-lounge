import React from 'react';
import { Carousel } from 'react-bootstrap';
import bg1 from '../images/bg1.jpg';
import bg2 from '../images/bg2.jpg';

function Gallery() {
  return (
    <Carousel>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={bg1}
          alt="Lounge Image 1"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={bg2}
          alt="Lounge Image 2"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default Gallery;
