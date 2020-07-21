import { CarouselProvider, ImageWithZoom, Slide, Slider, ButtonFirst, ButtonBack, ButtonNext, ButtonLast, ButtonPlay, CarouselContext } from "pure-react-carousel";
import React, { useContext, useState, useEffect } from "react";
import { Divider, Container, Button, Modal, Image } from "semantic-ui-react";

// https://github.com/express-labs/pure-react-carousel#examples

function CustomDotGroup({ slides, size, }) {
    const carouselContext = useContext(CarouselContext);
    const [currentState, setCurrentState] = useState(carouselContext.state);

    useEffect(() => {
        function onChange() {
            setCurrentState(carouselContext.state);
        }
        carouselContext.subscribe(onChange);
        return () => carouselContext.unsubscribe(onChange);
    }, [carouselContext]);

    return (
        <Container textAlign="center">
            <Button.Group size={size} basic>
                <Modal
                    basic
                    size='large'
                    trigger={<Button icon='expand arrows alternate' />}
                >
                    <Modal.Content>
                        <Image src={slides[currentState.currentSlide]} />
                    </Modal.Content>
                </Modal>

                <Button as={ButtonFirst} icon='angle double left' />
                <Button as={ButtonBack} icon='angle left' />

                <Button as={ButtonPlay} icon={currentState.isPlaying ? "pause" : "play"} />

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
                        <ImageWithZoom src={image} className={"contained-image"} />
                    </Slide>
                ))
            }
        </Slider>

        <Divider />
        <CustomDotGroup slides={images} />
    </CarouselProvider>
}

export default ImageCarousel;
