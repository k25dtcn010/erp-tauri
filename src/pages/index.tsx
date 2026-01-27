import { openMiniApp } from "zmp-sdk";
import { Box, Button, Icon, Page, Text, useNavigate } from "zmp-ui";

import Clock from "@/components/clock";
import Logo from "@/components/logo";
import bg from "@/static/bg.svg";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Page>
      <Box textAlign="center" className="space-y-1">
        <Text.Title size="xLarge">Hello world!</Text.Title>
        <Clock />
      </Box>
      <Box className="flex flex-col space-y-2">
        <Button
          variant="primary"
          suffixIcon={<Icon icon="zi-more-grid" />}
          onClick={() => {
            openMiniApp({
              appId: "1070750904448149704", // ZaUI Components
            });
          }}
        >
          ZaUI Component Library
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Box>
      <Logo className="fixed bottom-8" />
    </Page>
  );
}

export default HomePage;
