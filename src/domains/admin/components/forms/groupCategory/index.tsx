"use client";

import { TGetAllCategories } from "@/actions/category/category";
import Input from "@/shared/components/UI/input";

type TProps = {
  errorMsg: string;
  data: TGetAllCategories;
  onChange: (data: TGetAllCategories) => void;
};

const GroupCategory = ({ errorMsg, data, onChange }: TProps) => {
  return (
    <div className="grid grid-cols-3 text-gray-500 gap-y-4 items-center my-6 mx-4 text-sm">
      <span>Category Group Name:</span>
      <Input
        className="col-span-2 w-[200px]"
        name="name"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.currentTarget.value })}
        type="text"
        placeholder="name..."
      />
      <span>URL:</span>
      <Input
        className="col-span-2 w-[200px]"
        name="url"
        onChange={(e) => onChange({ ...data, url: e.currentTarget.value })}
        type="text"
        placeholder="URL..."
        value={data.url}
      />
      {errorMsg !== "" && (
        <div className="col-span-3">
          <span className="text-bethany-red-500">{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default GroupCategory;
