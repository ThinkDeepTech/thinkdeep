import { html } from "@polymer/lit-element";
import "@thinkdeep/deep-button";
import { stamp, remove } from "@thinkdeep/tools/testing";

const template = html`
    <deep-button label="customized"></deep-button>
`;

describe("deep-button", () => {
  let component;

  beforeEach(async () => {
    component = await stamp(template);
  });

  afterEach(() => {
    remove(component);
  });

  /* Sanity check */
  it("should be the correct component", () => {
    expect(component.localName).to.equal("deep-button");
  });
});
