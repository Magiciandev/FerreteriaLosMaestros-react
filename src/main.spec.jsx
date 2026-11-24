import { screen, waitFor } from "@testing-library/react";
import { instalarApi } from "./test/apiFalsa";

describe("main", () => {
  it("C93 la aplicación se monta en el elemento root", async () => {
    instalarApi();
    document.body.innerHTML = '<div id="root"></div>';
    await import("./main.jsx");
    await waitFor(() => expect(document.querySelector("#root main")).not.toBeNull());
    expect(screen.getAllByText("Ferretería Los Maestros").length).toBeGreaterThan(0);
  });
});
