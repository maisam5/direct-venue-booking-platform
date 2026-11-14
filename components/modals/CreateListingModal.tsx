"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import Modal from "./Modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { categories, getCategoryBySlug } from "@/constants/Categories";
import CategoryCard from "@/components/listings/CategoryCard";
import CountrySelect from "@/components/listings/CountrySelect";
import useCountries, { Country } from "@/custom-hooks/useCountries";
import Counter from "@/components/listings/Counter";
import ImageUpload, {
  GalleryPhotoItem,
} from "@/components/listings/ImageUpload";
import { toast } from "@/lib/toast";

const MapComponent = dynamic(
  () => import("@/components/general/map/MapComponent"),
  {
    ssr: false,
    loading: () => <p className="text-center py-6">Loading map...</p>,
  }
);

const STEPS = {
  CATEGORY: 0,
  LOCATION: 1,
  COUNTERS: 2,
  DETAILS: 3,
  IMAGES: 4,
  PRICE: 5,
};

export default function CreateListingModal() {
  const { isOpen, close, defaultKind, editingListing } =
    useCreateListingModal();
  const { currentRole, user } = useClerkAuthFlow();
  const { getByValue } = useCountries();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isEditing = Boolean(editingListing);

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [kindFilter, setKindFilter] = useState<"all" | "venue" | "vendor">(
    "all"
  );
  const [location, setLocation] = useState<null | Country>(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(120);
  const [bathroomCount, setBathroomCount] = useState(2);
  const [roomCount, setRoomCount] = useState(2);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "WEDDING",
    "CORPORATE",
  ]);
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<GalleryPhotoItem[]>([]);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingListing) {
      setStep(STEPS.CATEGORY);
      setKindFilter(editingListing.kind);
      const matchedCat =
        categories.find(
          (c) =>
            c.kind === editingListing.kind &&
            (editingListing.vendorSpecialty
              ? c.label
                  .toLowerCase()
                  .includes(editingListing.vendorSpecialty.toLowerCase())
              : true)
        ) ?? categories[0];
      setCategory(matchedCat.slug);
      const existingFeatures =
        editingListing.packages?.[0]?.includedFeatures ?? [];
      const matchedOptions = matchedCat.serviceOptions.filter((opt) =>
        existingFeatures.includes(opt)
      );
      setSelectedServiceOptions(
        matchedOptions.length > 0
          ? matchedOptions
          : matchedCat.serviceOptions.slice(0, 3)
      );
      setLocation(getByValue(editingListing.area) ?? null);
      setStreetAddress(editingListing.address || "");
      setGuestCount(editingListing.maxGuests || 120);
      setRoomCount(2);
      setBathroomCount(2);
      setTitle(editingListing.name || "");
      setDescription(editingListing.description || "");
      setContactEmail(
        editingListing.ownerEmail ||
          user?.primaryEmailAddress?.emailAddress ||
          ""
      );
      setContactPhone(
        editingListing.ownerPhone ||
          user?.primaryPhoneNumber?.phoneNumber ||
          ""
      );
      setSelectedEvents(
        editingListing.categories.map((c) => c.toUpperCase()) || ["WEDDING"]
      );
      const existingImgs =
        editingListing.galleryImages && editingListing.galleryImages.length > 0
          ? editingListing.galleryImages
          : editingListing.coverImage
          ? [editingListing.coverImage]
          : [];
      setPhotos(
        existingImgs.slice(0, 5).map((url, idx) => ({
          id: `existing-${idx}-${Date.now()}`,
          preview: url,
        }))
      );
      setPrice(String(editingListing.basePrice || ""));
    } else {
      setStep(STEPS.CATEGORY);
      if (defaultKind === "vendor" || currentRole === "VENDOR") {
        setKindFilter("vendor");
      } else if (defaultKind === "venue") {
        setKindFilter("venue");
      } else {
        setKindFilter("all");
      }
      setContactEmail(user?.primaryEmailAddress?.emailAddress || "");
      setContactPhone(user?.primaryPhoneNumber?.phoneNumber || "");
    }
  }, [isOpen, editingListing, defaultKind, currentRole, user]);

  const selectedCategoryObj = getCategoryBySlug(category);
  const isVendorCategory = selectedCategoryObj?.kind === "vendor";

  const handleSelectCategory = (slug: string) => {
    setCategory(slug);
    const catObj = getCategoryBySlug(slug);
    if (catObj) {
      setGuestCount(catObj.counters.guests?.defaultValue ?? 120);
      setRoomCount(catObj.counters.primary?.defaultValue ?? 2);
      setBathroomCount(catObj.counters.secondary?.defaultValue ?? 2);
      setSelectedServiceOptions(catObj.serviceOptions.slice(0, 3));
    }
  };

  const toggleServiceOption = (option: string) => {
    setSelectedServiceOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const stepTitle = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return "Which of these best describes your place or service?";
      case STEPS.LOCATION:
        return isVendorCategory
          ? "Where is your studio or service based?"
          : "Where is your venue located?";
      case STEPS.COUNTERS:
        return isVendorCategory
          ? `${selectedCategoryObj?.label || "Service"} Options & Capacity`
          : "Share capacity & venue amenities";
      case STEPS.DETAILS:
        return "Details & Direct Contact Info";
      case STEPS.IMAGES:
        return isVendorCategory
          ? "Add 3 to 5 portfolio / service photos"
          : "Add 3 to 5 photos of your venue";
      case STEPS.PRICE:
        return isVendorCategory
          ? "How much do you charge for this service?"
          : "How much do you charge per event / day?";
      default:
        return "";
    }
  };

  const handleAddFiles = (files: FileList) => {
    const remaining = 5 - photos.length;
    if (remaining <= 0) {
      toast("Maximum 5 photos allowed per listing.");
      return;
    }
    const toAdd = Array.from(files).slice(0, remaining);
    const newItems: GalleryPhotoItem[] = toAdd.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      preview: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...prev, ...newItems]);
  };

  const handleAddPresetUrl = (url: string) => {
    if (photos.length >= 5) {
      toast("Maximum 5 photos allowed per listing.");
      return;
    }
    if (photos.some((p) => p.preview === url)) return;
    setPhotos((prev) => [
      ...prev,
      { id: `preset-${Date.now()}-${Math.random()}`, preview: url },
    ]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleEventType = (ev: string) => {
    setSelectedEvents((prev) => {
      if (prev.includes(ev)) {
        return prev.length > 1 ? prev.filter((item) => item !== ev) : prev;
      }
      return [...prev, ev];
    });
  };

  const handleNextStep = () => {
    if (step === STEPS.CATEGORY && !category) {
      toast("Please select a category first.");
      return;
    }
    if (step === STEPS.LOCATION && !location?.value) {
      toast("Please select a city / district.");
      return;
    }
    if (step === STEPS.DETAILS) {
      if (!title.trim() || !description.trim()) {
        toast("Please enter both a title and description.");
        return;
      }
      if (!contactEmail.trim() || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
        toast("Please enter a valid contact email.");
        return;
      }
      if (!contactPhone.trim() || contactPhone.trim().length < 7) {
        toast("Please enter a valid contact phone number.");
        return;
      }
    }
    if (step === STEPS.IMAGES) {
      if (photos.length < 3) {
        toast("Please add at least 3 photos (minimum 3, maximum 5).");
        return;
      }
      if (photos.length > 5) {
        toast("Maximum 5 photos are allowed.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const submitListing = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !price ||
      !location?.value ||
      !category ||
      !contactEmail.trim() ||
      !contactPhone.trim()
    ) {
      toast("All fields including email and phone number are required!");
      return;
    }

    if (photos.length < 3 || photos.length > 5) {
      toast("Please provide between 3 and 5 photos.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("locationValue", location.value);
      formData.append("address", streetAddress || location.defaultAddress);
      formData.append("category", category);
      formData.append("roomCount", roomCount.toString());
      formData.append("bathroomCount", bathroomCount.toString());
      formData.append("guestCount", guestCount.toString());
      formData.append("eventTypes", selectedEvents.join(","));
      formData.append(
        "serviceOptions",
        JSON.stringify(selectedServiceOptions)
      );
      formData.append("contactEmail", contactEmail.trim());
      formData.append("contactPhone", contactPhone.trim());
      if (user?.fullName) {
        formData.append("ownerName", user.fullName);
      }

      const urlStrings: string[] = [];
      for (const item of photos) {
        if (item.file) {
          formData.append("images", item.file);
        } else if (item.preview) {
          urlStrings.push(item.preview);
        }
      }
      formData.append("imageUrls", JSON.stringify(urlStrings));

      const endpoint = isEditing
        ? `/api/listings/${editingListing!.id}`
        : "/api/listings";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
      ]);

      toast(
        isEditing
          ? "Listing updated successfully!"
          : "Listing created successfully!"
      );

      handleClose();
      router.push("/properties");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong", {
        style: {
          background: "#dc2626",
          color: "white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategory(null);
    setPrice("");
    setRoomCount(2);
    setBathroomCount(2);
    setGuestCount(120);
    setLocation(null);
    setStreetAddress("");
    setTitle("");
    setDescription("");
    setContactEmail("");
    setContactPhone("");
    setSelectedServiceOptions([]);
    setPhotos([]);
    setStep(STEPS.CATEGORY);
    close();
  };

  const visibleCategories = categories.filter((c) =>
    kindFilter === "all" ? true : c.kind === kindFilter
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEditing
          ? `Edit Listing · ${editingListing?.name}`
          : kindFilter === "vendor"
          ? "List your vendor service"
          : "List your venue"
      }
    >
      {/* step indicator & progress bar */}
      <div className="mb-5 space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <span>Step {step + 1} of 6</span>
          <span className="font-semibold text-[var(--ink)]">{stepTitle()}</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--soft)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF5A5F] transition-all duration-300"
            style={{ width: `${((step + 1) / 6) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[260px] flex items-center justify-center rounded-xl text-[var(--ink)] py-2">
        {step === STEPS.CATEGORY && (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
              {(["all", "venue", "vendor"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKindFilter(k)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                    kindFilter === k
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {k === "all"
                    ? "All Categories"
                    : k === "venue"
                    ? "Venues Only"
                    : "Vendor Services"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-h-[310px] overflow-y-auto pr-1">
              {visibleCategories.map((item) => (
                <CategoryCard
                  label={item.label}
                  icon={item.icon}
                  description={item.description}
                  key={item.slug}
                  onClick={() => handleSelectCategory(item.slug)}
                  selected={category === item.slug}
                />
              ))}
            </div>
          </div>
        )}

        {step === STEPS.LOCATION && (
          <div className="w-full space-y-4 py-2">
            <CountrySelect
              value={location}
              onChange={(value) => {
                setLocation(value);
                if (value && !streetAddress) {
                  setStreetAddress(value.defaultAddress);
                }
              }}
            />

            <Input
              name="streetAddress"
              label="Exact Street Address (For Verification Visit)"
              placeholder="e.g., Pier 9 North Basin, Waterfront"
              value={streetAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStreetAddress(e.target.value)
              }
            />

            <div className="h-64 rounded-xl overflow-hidden border border-[var(--line)]">
              <MapComponent
                center={location?.latlng || [40.7081, -74.0018]}
                label={
                  location
                    ? `${location.label} (${location.region})`
                    : "Select a district above"
                }
              />
            </div>
          </div>
        )}

        {step === STEPS.COUNTERS && selectedCategoryObj && (
          <div className="w-full space-y-5">
            <div className="space-y-1">
              {selectedCategoryObj.counters.guests && (
                <Counter
                  title={selectedCategoryObj.counters.guests.label}
                  subtitle={selectedCategoryObj.counters.guests.subtitle}
                  value={guestCount}
                  step={selectedCategoryObj.counters.guests.step}
                  min={selectedCategoryObj.counters.guests.min}
                  onChange={setGuestCount}
                />
              )}
              {selectedCategoryObj.counters.primary && (
                <Counter
                  title={selectedCategoryObj.counters.primary.label}
                  subtitle={selectedCategoryObj.counters.primary.subtitle}
                  value={roomCount}
                  step={selectedCategoryObj.counters.primary.step}
                  min={selectedCategoryObj.counters.primary.min}
                  onChange={setRoomCount}
                />
              )}
              {selectedCategoryObj.counters.secondary && (
                <Counter
                  title={selectedCategoryObj.counters.secondary.label}
                  subtitle={selectedCategoryObj.counters.secondary.subtitle}
                  value={bathroomCount}
                  step={selectedCategoryObj.counters.secondary.step}
                  min={selectedCategoryObj.counters.secondary.min}
                  onChange={setBathroomCount}
                />
              )}
            </div>

            <div className="space-y-2 text-left pt-2 border-t border-[var(--line)]">
              <span className="block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                {selectedCategoryObj.optionsLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCategoryObj.serviceOptions.map((option) => {
                  const active = selectedServiceOptions.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleServiceOption(option)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        active
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                          : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === STEPS.DETAILS && (
          <div className="space-y-4 w-full">
            <Input
              name="title"
              label="Listing Title"
              placeholder="e.g., Mercer Salt Warehouse or Studio Lumina"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                name="contactEmail"
                type="email"
                label="Public Contact Email *"
                placeholder="owner@venue.com"
                value={contactEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setContactEmail(e.target.value);
                }}
              />
              <Input
                name="contactPhone"
                type="tel"
                label="Public Contact Phone *"
                placeholder="+1 (212) 555-0199"
                value={contactPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setContactPhone(e.target.value);
                }}
              />
            </div>

            <Input
              as="textarea"
              name="description"
              label={
                isVendorCategory
                  ? "Service Description & Package Details"
                  : "Description & Architectural Notes"
              }
              placeholder={
                isVendorCategory
                  ? "Describe your service style, equipment/team included, setup time, and direct booking terms..."
                  : "Describe natural light, load-in access, catering policy, and direct owner terms..."
              }
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value);
              }}
            />

            <div className="space-y-1.5 text-left">
              <span className="block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Supported Event Types
              </span>
              <div className="flex flex-wrap gap-2">
                {(["WEDDING", "BIRTHDAY", "CORPORATE"] as const).map((ev) => {
                  const active = selectedEvents.includes(ev);
                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => toggleEventType(ev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        active
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                          : "border-[var(--line)] text-[var(--muted)]"
                      }`}
                    >
                      {ev.charAt(0) + ev.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === STEPS.IMAGES && (
          <ImageUpload
            photos={photos}
            onAddFiles={handleAddFiles}
            onAddPresetUrl={handleAddPresetUrl}
            onRemovePhoto={handleRemovePhoto}
            minPhotos={3}
            maxPhotos={5}
          />
        )}

        {step === STEPS.PRICE && (
          <div className="w-full space-y-5">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--soft)] p-4 text-left space-y-1">
              <span className="label block">0% Platform Commission</span>
              <p className="text-xs text-[var(--muted)]">
                You keep 100% of the price you set below. Your contact email (
                {contactEmail}) and phone ({contactPhone}) will be shown on your
                listing so planners can reach you directly.
              </p>
            </div>

            <Input
              min={10}
              type="number"
              name="price"
              label="Direct Base Price ($ USD)"
              placeholder="e.g., 3500"
              value={price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPrice(e.target.value);
              }}
            />

            {location && title && (
              <div className="rounded-xl border border-[var(--line)] p-4 text-left text-xs space-y-1">
                <div className="font-semibold text-sm text-[var(--ink)]">
                  Summary: {title}
                </div>
                <div className="text-[var(--muted)]">
                  {location.label} · Up to {guestCount} guests · {photos.length}{" "}
                  photos · {contactPhone}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-7 flex gap-3">
        {step > STEPS.CATEGORY && (
          <Button
            onClick={() => setStep((prev) => prev - 1)}
            variant="outline"
          >
            Back
          </Button>
        )}

        <Button
          loading={loading}
          disabled={loading}
          onClick={() =>
            step < STEPS.PRICE ? handleNextStep() : submitListing()
          }
        >
          {step === STEPS.PRICE
            ? isEditing
              ? "Save Changes"
              : "Create listing"
            : "Next"}
        </Button>
      </div>
    </Modal>
  );
}
