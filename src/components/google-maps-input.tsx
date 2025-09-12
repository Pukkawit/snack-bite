"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { MapPin, ExternalLink, Copy, Check, Asterisk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface GoogleMapsInputProps {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  instruction?: string | React.ReactNode;
  required?: boolean;
  tooltip?: {
    message: string | React.ReactNode;
  };
  className?: string;
  error?: string;
}

export function GoogleMapsInput({
  name,
  value = "",
  onChange,
  onBlur,
  placeholder = "Enter address or location",
  label = "Location",
  instruction,
  required = false,
  tooltip,
  className = "",
  error,
}: GoogleMapsInputProps) {
  const [address, setAddress] = useState("");
  const [embedHtml, setEmbedHtml] = useState(value);
  const [copied, setCopied] = useState(false);

  const generateEmbedHtml = (location: string) => {
    if (!location.trim()) return "";

    // Encode the location for URL
    const encodedLocation = encodeURIComponent(location.trim());

    // Use Google Maps embed format with search query (fallback approach)
    const fallbackUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    // Return complete iframe HTML string with fallback URL
    const iframeHtml = `<iframe src="${fallbackUrl}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

    return iframeHtml;
  };

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);

    const newEmbedHtml = generateEmbedHtml(newAddress);
    setEmbedHtml(newEmbedHtml);

    // Call parent onChange with the iframe HTML
    if (onChange) {
      onChange(newEmbedHtml);
    }
  };

  // Open location in Google Maps
  const openInGoogleMaps = () => {
    if (!address.trim()) return;

    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      address
    )}`;
    window.open(mapsUrl, "_blank");
  };

  const copyEmbedHtml = async () => {
    if (!embedHtml) return;

    try {
      await navigator.clipboard.writeText(embedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy HTML:", err);
    }
  };

  // Update internal state when value prop changes
  useEffect(() => {
    setEmbedHtml(value);
  }, [value]);

  const extractUrlFromHtml = (html: string) => {
    const match = html.match(/src="([^"]*)"/);
    return match ? match[1] : "";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex flex-col">
          <label
            className={cn(
              `cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-start`
            )}
          >
            {label}
            {required && <Asterisk size={14} className="text-destructive" />}
          </label>
          {instruction && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-xs text-left text-info cursor-pointer hover:text-primary">
                  {instruction}
                </TooltipTrigger>
                <TooltipContent className="max-w-sm text-xs bg-muted">
                  {tooltip?.message}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      <div className="space-y-2">
        {/* Address Input */}
        <div className="relative">
          <Input
            id={name}
            name={name}
            type="text"
            value={address}
            onChange={handleAddressChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            className={`pl-10 ${error ? "border-red-500" : ""}`}
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Action Buttons */}
        {address && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              className="flex items-center gap-2 bg-transparent"
            >
              <ExternalLink className="h-3 w-3" />
              Open in Maps
            </Button>

            {embedHtml && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyEmbedHtml}
                className="flex items-center gap-2 bg-transparent"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied!" : "Copy HTML"}
              </Button>
            )}
          </div>
        )}

        {embedHtml && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Generated Embed HTML:
            </Label>
            <div className="p-2 bg-muted rounded text-xs font-mono break-all max-h-20 overflow-y-auto">
              {embedHtml}
            </div>
          </div>
        )}

        {/* Map Preview */}
        {embedHtml && address && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Map Preview:
            </Label>
            <div className="w-full h-48 rounded-lg overflow-hidden border">
              <iframe
                src={extractUrlFromHtml(embedHtml)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${address}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <input type="hidden" name={name} value={embedHtml} />
    </div>
  );
}

// Example usage with different form libraries and new props:

/*
// With React Hook Form (your current usage):
import { useForm, Controller } from 'react-hook-form'
import { Link } from 'next/link'

const MyForm = () => {
  const { control, handleSubmit } = useForm()
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="google_maps_embed"
        control={control}
        render={({ field, fieldState }) => (
          <GoogleMapsInput
            {...field}
            label="Google Maps Embed URL"
            instruction="Register your Business on Google Business Profile"
            tooltip={{
              message: (
                <p>
                  If you would like your business to appear on google search
                  result, click{" "}
                  <Link
                    href="https://api.whatsapp.com/send/?phone=2348136289052&text=Hi+Pukkawit%21+I+would+like+my+business+to+appear+on+google+search+result.%20Kindly+assist+me+to+register+my+business+on+Google+Business+Profile.&type=phone_number&app_absent=0"
                    target="_blank"
                    className="underline text-primary uppercase font-semibold"
                  >
                    here
                  </Link>{" "}
                  to get started
                </p>
              ),
            }}
            error={fieldState.error?.message}
            required
          />
        )}
      />
    </form>
  )
}

// With Formik:
import { Formik, Field } from 'formik'

const MyFormikForm = () => (
  <Formik
    initialValues={{ location: '' }}
    onSubmit={values => console.log(values)}
  >
    <Field name="location">
      {({ field, meta }) => (
        <GoogleMapsInput
          {...field}
          label="Store Location"
          instruction="Find your exact business location"
          error={meta.touched && meta.error ? meta.error : undefined}
          required
        />
      )}
    </Field>
  </Formik>
)

// With traditional HTML form:
const TraditionalForm = () => {
  const [location, setLocation] = useState('')
  
  return (
    <form onSubmit={e => {
      e.preventDefault()
      console.log('Location HTML:', location) // Returns complete iframe HTML
    }}>
      <GoogleMapsInput
        name="location"
        value={location}
        onChange={setLocation}
        label="Event Location"
        instruction="Enter the venue address"
        tooltip={{
          message: "This will help attendees find your event location easily"
        }}
        required
      />
      <button type="submit">Submit</button>
    </form>
  )
}
*/
