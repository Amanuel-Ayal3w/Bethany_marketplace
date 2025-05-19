"use client";
import { useState } from "react";

import { TGetAllCategories, addCategory } from "@/actions/category/category";
import Button from "@/shared/components/UI/button";
import Popup from "@/shared/components/UI/popup";

import GroupCategory from "../../forms/groupCategory";

type TProps = {
  onReset: () => void;
};

const AddCategoryGroup = ({ onReset }: TProps) => {
  const [showWindow, setShowWindow] = useState<boolean>(false);
  const defaultGroupData: TGetAllCategories = {
    id: "",
    parentID: null,
    name: "",
    url: ""
  };
  const [errorMsg, setErrorMsg] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [groupCategoryData, setGroupCategory] = useState<TGetAllCategories>(defaultGroupData);

  const handleAddGroup = async () => {
    const { name, url } = groupCategoryData;
    if (!name || !url) {
      setErrorMsg("All fields are required!");
      return;
    }
    if (name === "") {
      setErrorMsg("Name is empty!");
      return;
    }
    if (url === "") {
      setErrorMsg("URL is empty!");
      return;
    }

    setButtonDisabled(true);
    const result = await addCategory(groupCategoryData);

    if (result.res) {
      setGroupCategory(defaultGroupData);
      setButtonDisabled(false);
      setErrorMsg("");
      setShowWindow(false);
      onReset();
    } else {
      setButtonDisabled(false);
      setErrorMsg("Can't Insert it to Database!");
    }
  };

  return (
    <div>
      <Button className="text-sm py-1" onClick={() => setShowWindow(true)}>
        Add Group
      </Button>
      {showWindow && (
        <Popup
          content={<GroupCategory errorMsg={errorMsg} data={groupCategoryData} onChange={setGroupCategory} />}
          isLoading={buttonDisabled}
          onCancel={() => setShowWindow(false)}
          onClose={() => setShowWindow(false)}
          onSubmit={handleAddGroup}
          title="Add Category Group"
        />
      )}
    </div>
  );
};

export default AddCategoryGroup;
