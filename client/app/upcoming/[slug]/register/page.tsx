// app/upcoming/[slug]/register/page.tsx — one event's own registration
// form, reached from "Register your interest" on the upcoming-events page.
//
// The form itself is built by the admin per event (see the Events tab in the
// admin console), so nothing about the fields is hardcoded here — the server
// returns the event header and its form definition together, and a closed
// form still resolves so an old link lands on a courteous message rather
// than a 404.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/registration/EventRegistrationForm";
import { serverRequest } from "@/lib/api/server";
import type { EventRegistrationPage } from "@/types/registration";

interface RegisterPageProps {
  params: Promise<{ slug: string }>;
}

function formPath(slug: string): string {
  return `/events/${encodeURIComponent(slug)}/registration-form`;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await serverRequest<EventRegistrationPage>(formPath(slug));
  if (!page) return { title: "Event not found | ELEOS Research Innovations" };

  return {
    title: `Register — ${page.event.title} | ELEOS Research Innovations (ERI)`,
    description: `Register your interest for ${page.event.title}.`,
  };
}

export default async function EventRegisterPage({ params }: RegisterPageProps) {
  const { slug } = await params;
  const page = await serverRequest<EventRegistrationPage>(formPath(slug));
  if (!page) notFound();

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <PageHero
          id="event-register-hero"
          title="Register Your Interest"
          subtitle={page.event.title}
          breadcrumb="Register"
        />
        <EventRegistrationForm event={page.event} form={page.form} />
      </main>
      <Footer />
    </div>
  );
}
