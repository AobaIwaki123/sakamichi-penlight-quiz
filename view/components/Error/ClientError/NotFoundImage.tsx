"use client";

import {
  Button,
  Container,
  Image,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import classes from "./NotFoundImage.module.css";

export function NotFoundImage() {
  return (
    <Container className={classes.root}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 40, sm: 80 }}>
        <Image className={classes.mobileImage} src="/not-found.jpg" />
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text c="dimmed" size="lg">
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error contact support.
          </Text>
          <Button
            className={classes.control}
            mt="xl"
            onClick={() => {
              window.location.href = "/";
            }}
            size="md"
            variant="outline"
          >
            Get back to home page
          </Button>
        </div>
        <Image className={classes.desktopImage} src="/not-found.jpeg" />
      </SimpleGrid>
    </Container>
  );
}
