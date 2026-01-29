import { asChildPropDef, heightPropDefs, widthPropDefs } from '@radix-ui/themes/props';

import type { GetPropDefTypes, PropDef } from '@radix-ui/themes/props';

const collapsibleRootPropDefs = {
    ...asChildPropDef,
};

const collapsibleContentPropDefs = {
    ...asChildPropDef,
    width: widthPropDefs.width,
    minWidth: widthPropDefs.minWidth,
    maxWidth: { ...widthPropDefs.maxWidth, default: '300px' },
    ...heightPropDefs,
} satisfies {
    width: PropDef<string>;
    minWidth: PropDef<string>;
    maxWidth: PropDef<string>;
};

type CollapsibleContentOwnProps = GetPropDefTypes<
    typeof collapsibleContentPropDefs & typeof asChildPropDef & typeof widthPropDefs
>;

export { collapsibleRootPropDefs, collapsibleContentPropDefs };
export type { CollapsibleContentOwnProps };
