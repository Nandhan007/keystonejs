import { useState } from "react";
import PropTypes from "prop-types";

const Sidebar = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar visibility state

  const menuItems = [
    {
      title: "1.0 Strategic Summary",
      icon: "📊",
      submenu: [
        { title: "Strategic Summary", path: "/strategic-summary" },
        { title: "Dashboard", path: "/strategic-summary/dashboard" },
        { title: "Survey Demo", path: "/strategic-summary/demo" }
      ],
    },
    {
      title: "2.0 Strategic Planning",
      icon: "🗺️",
      submenu: [{ title: "Sales and Margin Planning", path: "/strategic-planning" }],
    },
    {
      title: "3.0 Reconciliation",
      icon: "🤝",
      submenu: [
        { title: "Summary", path: "/reconciliation/summary" },
        { title: "TD Reconciliation", path: "/reconciliation" },
      ],
    },
    {
      title: "4.0 Approval",
      icon: "✅",
      submenu: [{ title: "TD Approval", path: "/approval" }],
    },
  ];

  const toggleSubmenu = (menuTitle) => {
    setActiveMenu(activeMenu === menuTitle ? "" : menuTitle);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full fixed top-0 left-0">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-1/5" : "w-16"
        } bg-gray-800 text-white shadow-lg transition-all duration-300`}
      >
        <div className="p-4 flex justify-between items-center">
          <button
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? "✖" : "☰"}
          </button>
          {isSidebarOpen && <span className="text-lg font-bold">Menu</span>}
        </div>
        <ul className="space-y-2 p-4 mt-5">
          {menuItems.map((item, index) => (
            <li key={index}>
              <div
                className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-700 ${
                  item.submenu ? "border-b border-gray-700" : ""
                }`}
                onClick={() => item.submenu && toggleSubmenu(item.title)}
              >
                <div className="flex items-center space-x-3">
                  <span>{item.icon}</span>
                  {isSidebarOpen && <span>{item.title}</span>}
                </div>
                {item.submenu && isSidebarOpen && (
                  <span>{activeMenu === item.title ? "▲" : "▼"}</span>
                )}
              </div>
              {item.submenu && activeMenu === item.title && isSidebarOpen && (
                <ul className="ml-8 space-y-1">
                  {item.submenu.map((submenuItem, subIndex) => (
                    <li key={subIndex}>
                      <a
                        href={submenuItem.path}
                        className="block p-2 hover:bg-gray-700 rounded text-start"
                      >
                        {submenuItem.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div
        className={`${
          isSidebarOpen ? "w-4/5" : "w-full"
        } p-8 transition-all duration-300`}
      >
        {children}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Sidebar;
