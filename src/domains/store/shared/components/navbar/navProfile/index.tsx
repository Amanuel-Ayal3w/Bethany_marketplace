"use-client";

import { useRef } from "react";
import Link from "next/link";

import { ProfileIcon } from "@/shared/components/icons/svgIcons";
import Button from "@/shared/components/UI/button";
import { useToggleMenu } from "@/shared/hooks/useToggleMenu";
import { useSupabaseAuth } from "@/shared/hooks/useSupabaseAuth";
import { cn } from "@/shared/utils/styling";

const NavBarProfile = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useToggleMenu(false, menuRef);
  const { user, signOut, isLoading } = useSupabaseAuth();

  const toggleMenu = () => {
    setIsActive((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsActive(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={toggleMenu}
        className={cn(
          "border-white h-9 hover:border-gray-300 transition-all text-gray-500 text-sm duration-300",
          isActive && "border-gray-300 bg-gray-50"
        )}
      >
        <ProfileIcon width={16} className="fill-white transition-all duration-300 stroke-gray-500 stroke-2" />
        <span className="select-none hidden lg:block">
          {isLoading ? "Loading..." : user ? "Admin" : "Admin"}
        </span>
      </Button>
      <div
        ref={menuRef}
        className={cn(
          "min-w-[180px] absolute rounded-lg overflow-hidden flex flex-col items-center top-[42px] right-0 border border-gray-300 bg-white shadow-md scale-[0.97] invisible opacity-0 transition-all duration-300 p-1 z-10",
          isActive && "scale-100 visible opacity-100"
        )}
      >
        {user ? (
          <>
            <div className="w-full px-4 py-2 border-b border-gray-200">
              <p className="font-medium text-sm">Administrator</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Link href="/profile" className="w-full">
              <Button
                onClick={() => setIsActive(false)}
                className="w-full border-white font-semibold text-sm hover:bg-gray-100 justify-start"
              >
                Admin Profile
              </Button>
            </Link>
            <Link href="/admin" className="w-full">
              <Button
                onClick={() => setIsActive(false)}
                className="w-full border-white font-semibold text-sm hover:bg-gray-100 justify-start"
              >
                Admin Dashboard
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              className="w-full border-white font-semibold text-sm hover:bg-gray-100 text-red-600 justify-start"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="w-full">
              <Button
                className="w-full border-white font-semibold text-sm hover:bg-gray-100"
                onClick={() => setIsActive(false)}
              >
                Admin Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBarProfile;
