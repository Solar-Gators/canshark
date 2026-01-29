import { DotsHorizontalIcon, HamburgerMenuIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import * as R from '@radix-ui/themes';
import { DBPopover } from './db-popover';

export function Menu() {
    return (
        <R.Dialog.Root>
            <R.DropdownMenu.Root>
                <R.DropdownMenu.Trigger>
                    <R.Button variant="ghost" size="1">
                        <DotsHorizontalIcon />
                        More
                    </R.Button>
                </R.DropdownMenu.Trigger>
                <R.DropdownMenu.Content size="2">
                    <R.DropdownMenu.Sub>
                        <R.DropdownMenu.SubTrigger>Database info</R.DropdownMenu.SubTrigger>
                        <R.DropdownMenu.SubContent>
                            <DBPopover />
                        </R.DropdownMenu.SubContent>
                    </R.DropdownMenu.Sub>
                </R.DropdownMenu.Content>
            </R.DropdownMenu.Root>
        </R.Dialog.Root>
    );
}
