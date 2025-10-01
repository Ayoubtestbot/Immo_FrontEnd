import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Dropdown } from 'react-bootstrap';
import { usePopper } from 'react-popper';

// This component will render the dropdown menu content outside the normal DOM flow
const CustomDropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { show?: boolean }>(
  ({ children, style, className, 'aria-labelledby': labeledBy, show, ...props }, ref) => {
    const [popperElement, setPopperElement] = React.useState<HTMLDivElement | null>(null);
    const { styles, attributes } = usePopper(ref as any, popperElement, {
      placement: 'bottom-start',
      strategy: 'fixed', // Ensure it's fixed relative to the viewport
    });

    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
      // This code will only run on the client-side
      let root = document.getElementById('dropdown-portal-root');
      if (!root) {
        root = document.createElement('div');
        root.setAttribute('id', 'dropdown-portal-root');
        document.body.appendChild(root);
      }
      setPortalRoot(root);
    }, []); // Empty dependency array ensures this runs once on mount

    if (!portalRoot) {
      return null; // Don't render anything until the portal root is available on the client
    }

    return ReactDOM.createPortal(
      <div
        ref={setPopperElement}
        style={{ ...styles.popper, zIndex: 1050 }} // Ensure high z-index
        className={className}
        aria-labelledby={labeledBy}
        {...attributes.popper}
        {...props}
      >
        <Dropdown.Menu show={show} style={{ ...style, margin: 0 }} className="dropdown-menu-fix">
          {children}
        </Dropdown.Menu>
      </div>,
      portalRoot
    );
  }
);

CustomDropdownMenu.displayName = 'CustomDropdownMenu';

export default CustomDropdownMenu;