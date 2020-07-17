import { CarouselProvider, ImageWithZoom, Slide, Slider, ButtonFirst, ButtonBack, ButtonNext, ButtonLast, ButtonPlay } from "pure-react-carousel";
import React from "react";
import { Divider, Container, Button } from "semantic-ui-react";

// https://github.com/express-labs/pure-react-carousel#examples

function CustomDotGroup({ slides, size, }) {
    return (
        <Container textAlign="center">
            <Button.Group size={size}>
                <Button as={ButtonFirst} icon='angle double left' />
                <Button as={ButtonBack} icon='angle left' />

                <Button as={ButtonPlay} icon={'pause'} />

                <Button as={ButtonNext} icon='angle right' />
                <Button as={ButtonLast} icon='angle double right' />
            </Button.Group>
        </Container>
    )
}

function ImageCarousel({ images }) {
    return images && images.length > 0 && <CarouselProvider
        isPlaying={true}
        naturalSlideWidth={16}
        naturalSlideHeight={9}
        totalSlides={images.length}
    >
        <Slider>
            {
                images.map((image, index) => (
                    <Slide tag="a" index={index} key={index}>
                        <ImageWithZoom src={image} onClick={() => { console.log("clicked on image", image) }} className={"contained-image"}/>
                    </Slide>
                ))
            }
        </Slider>

        <Divider />
        <CustomDotGroup slides={images.length} />
    </CarouselProvider>
}

export default ImageCarousel;
