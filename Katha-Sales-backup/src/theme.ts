import { extendTheme } from "@chakra-ui/react";

const colors = {
  primary: {
    50: "#e6f2ff",
    100: "#bdd9ff",
    200: "#93bfff",
    300: "#6aa6ff",
    400: "#418cff",
    500: "#1773ff", // Primary color
    600: "#0057d9",
    700: "#003ca6",
    800: "#002473",
    900: "#000d40",
  },
};

const theme = extendTheme({
  colors,
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "md",
      },
      variants: {
        primary: {
          bg: "primary.500",
          color: "white",
          _hover: {
            bg: "primary.600",
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "primary.500",
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "medium",
      },
    },
  },
});

export default theme; 