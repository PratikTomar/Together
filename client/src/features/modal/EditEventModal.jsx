import { format } from "date-fns";
import { useEffect } from "react";
import { useEventsContext } from "../../contexts/EventsContext";
import { useFormContext } from "../../contexts/FormContext";
import { useModalContext } from "../../contexts/ModalContext";
import dataService from "../../services/dataService";
import FormError from "../form/FormError";

const EditEventModal = () => {
  const modal = useModalContext();
  const { setEvents } = useEventsContext();
  const event = modal.activeEvent;

  const {
    formData,
    setFormData,
    formCreateEventErrors,
    setFormCreateEventErrors,
    formScheduleEventErrors,
    setFormScheduleEventErrors,
  } = useFormContext();

  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      initialDate: "",
      finalDate: "",
      location: "",
      startTime: "00:00",
      endTime: "00:00",
      recurring: {
        rate: "noRecurr",
        days: [],
      },
    });
    setFormCreateEventErrors([]);
    setFormScheduleEventErrors([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const validateInput = () => {
    const errors = [];
    if (!formData.title) {
      errors.push(`Error: Title field can't be empty`);
    }
    if (formData.description?.length > 280) {
      errors.push(
        `Error: Description must be less than 280 characters. Current character count: ${formData.description?.length}.`
      );
    }

    if (!formData.description) {
      errors.push(`Error: description field can't be empty`);
    }

    if (!formData.location) {
      errors.push(`Error: Location field can't be empty`);
    }

    setFormCreateEventErrors(errors);

    return errors.length === 0;
  };

  const scheduleEventErrors = (startAt, endAt) => {
    const errors = [];

    if (startAt > endAt) {
      errors.push(`Error: Start date must be before end date`);
    }

    setFormScheduleEventErrors(errors);

    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) return;

    const startAt = new Date(
      `${formData.initialDate}T${formData.startTime}`
    ).toISOString();
    const endAt = new Date(
      `${formData.finalDate}T${formData.endTime}`
    ).toISOString();

    if (!scheduleEventErrors(startAt, endAt)) {
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      startAt,
      endAt,
    };

    const res = await dataService.updateEvent(event._id, payload);

    setEvents((prev) =>
      prev.map((el) => (el._id === event._id ? res.data.event : el))
    );
    resetFormData();
    modal.handleClose();
  };

  useEffect(() => {
    // Prefilling the values on clicking of edit button
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        initialDate: format(new Date(event.startAt), "yyyy-MM-dd") || "",
        finalDate: format(new Date(event.endAt), "yyyy-MM-dd") || "",
        startTime: format(new Date(event.startAt), "HH:mm") || "00:00",
        endTime: format(new Date(event.endAt), "HH:mm") || "00:00",
      });
    }

    if (!modal.isOpen) {
      resetFormData();
      modal.setActiveEvent(null);
      setFormCreateEventErrors([]);
      setFormScheduleEventErrors([]);
    }
  }, [event, modal.isOpen]);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="p-4 flex flex-col gap-3 bg-white rounded-lg"
      >
        <div className="flex flex-col">
          {formCreateEventErrors.map((error, index) => {
            return <FormError error={error} key={index} />;
          })}
          {formScheduleEventErrors.map((error, index) => {
            return <FormError error={error} key={index} />;
          })}
        </div>

        {/* TITLE FIELD */}
        <div className="w-full mx-2 flex-1">
          <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
            Title
          </div>
          <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
            <input
              type="text"
              onChange={handleChange}
              value={formData["title"] || ""}
              name="title"
              placeholder="Title"
              className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
            />
          </div>
        </div>

        {/* DESCRIPTION FIELD */}
        <div className="w-full mx-2 flex-1">
          <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
            Description
          </div>
          <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
            <textarea
              type="text"
              onChange={handleChange}
              value={formData["description"] || ""}
              name="description"
              placeholder="Description"
              className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
              rows="8"
            ></textarea>
          </div>
        </div>

        {/* LOCATION FIELD */}
        <div className="w-full mx-2 flex-1">
          <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
            Location
          </div>
          <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
            <input
              type="text"
              onChange={handleChange}
              value={formData["location"] || ""}
              name="location"
              placeholder="Location"
              className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          {/* START DATE FIELD */}
          <div className="w-full mx-2 flex-1">
            <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
              Start Date
            </div>
            <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
              <input
                type="date"
                onChange={handleChange}
                value={formData["initialDate"] || ""}
                name="initialDate"
                placeholder="Start Date"
                className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
                required
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          {/* START TIME FIELD */}
          <div className="w-full mx-2 flex-1">
            <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
              Start Time
            </div>
            <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
              <input
                type="time"
                onChange={handleChange}
                value={formData["startTime"] || ""}
                name="startTime"
                className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
              />
            </div>
          </div>

          {/* END DATE FIELD */}
          <div className="w-full mx-2 flex-1">
            <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
              End Date
            </div>
            <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
              <input
                type="date"
                onChange={handleChange}
                value={formData["finalDate"] || ""}
                name="finalDate"
                placeholder="End Date"
                className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
                required
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          {/* END TIME FIELD */}
          <div className="w-full mx-2 flex-1">
            <div className="font-bold h-6 mt-3 text-grey-500 text-xs leading-8 uppercase">
              End Time
            </div>
            <div className="bg-white my-2 p-1 flex border border-gray-200 rounded-sm">
              <input
                type="time"
                onChange={handleChange}
                value={formData["endTime"] || ""}
                name="endTime"
                className="p-1 px-2 appearance-none outline-non w-full text-gray-800"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded cursor-pointer  hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out"
        >
          Update Event
        </button>
      </form>
    </div>
  );
};

export default EditEventModal;
